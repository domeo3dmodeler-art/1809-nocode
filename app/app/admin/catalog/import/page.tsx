'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Badge } from '../../../../components/ui';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, History, RefreshCw, Trash2, Database, Upload as UploadIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import FieldMappingInterface from '../../../../components/import/FieldMappingInterface';
import { useImportTemplate, useFileAnalysis } from '../../../../hooks/useImportTemplate';

interface ImportHistoryItem {
  id: string;
  filename: string;
  imported_count: number;
  error_count: number;
  status: string;
  created_at: string;
}

interface PriceListData {
  headers: string[];
  rows: any[][];
  totalRows: number;
}

interface PhotoData {
  files: File[];
  totalCount: number;
}

interface PropertyMapping {
  fieldName: string;
  displayName: string;
  dataType: 'text' | 'number' | 'select' | 'boolean' | 'image';
  isRequired: boolean;
  isFilterable: boolean;
  isVisible: boolean;
  options?: string[];
  unit?: string;
}

interface CatalogCategory {
  id: string;
  name: string;
  level: number;
  parent_id?: string;
  product_count?: number;
  displayName?: string;
}

type ImportStep = 'upload' | 'catalog' | 'mapping' | 'properties' | 'photos' | 'complete';

export default function CatalogImportPage() {
  // Основные состояния
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [priceListData, setPriceListData] = useState<PriceListData | null>(null);
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [propertyMappings, setPropertyMappings] = useState<PropertyMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCatalogCategoryId, setSelectedCatalogCategoryId] = useState<string>('');
  const [requiredFields, setRequiredFields] = useState<any[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  
  // Новые состояния для маппинга
  const [fileHeaders, setFileHeaders] = useState<any[]>([]);
  const [fieldMappings, setFieldMappings] = useState<any[]>([]);
  
  // Хуки для работы с шаблонами
  const { template, loading: templateLoading, loadTemplate, createTemplate } = useImportTemplate();
  const { analyzeFile, analyzing } = useFileAnalysis();
  
  // Состояния для истории и результатов
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [photoCategorySearchTerm, setPhotoCategorySearchTerm] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoMappingProperty, setPhotoMappingProperty] = useState<string>('');
  const [existingProductProperties, setExistingProductProperties] = useState<string[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [fieldSettings, setFieldSettings] = useState<Record<string, {
    displayName: string;
    isRequired: boolean;
    dataType: 'text' | 'number' | 'select' | 'boolean' | 'image';
  }>>({});

  useEffect(() => {
    loadImportHistory();
    loadCatalogCategories();
    
    // Проверяем URL параметры для предварительного выбора категории
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      setSelectedCatalogCategoryId(categoryParam);
    }
  }, []);

  // Загружаем свойства существующих товаров при выборе категории
  useEffect(() => {
    if (selectedCatalogCategoryId) {
      loadExistingProductProperties(selectedCatalogCategoryId);
    }
  }, [selectedCatalogCategoryId]);

  const loadImportHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch('/api/catalog/import?action=history');
      const data = await response.json();
      setImportHistory(data);
    } catch (error) {
      console.error('Error loading import history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadExistingProductProperties = async (categoryId: string) => {
    if (!categoryId) {
      setExistingProductProperties([]);
      return;
    }

    setLoadingProperties(true);
    try {
      const response = await fetch(`/api/catalog/products?categoryId=${categoryId}&limit=10`);
      const data = await response.json();
      
      console.log('Existing products response:', data);
      
      if (data.success && data.products && data.products.length > 0) {
        // Собираем все уникальные свойства из товаров
        const allProperties = new Set<string>();
        
        data.products.forEach((product: any) => {
          if (product.properties_data) {
            try {
              const properties = typeof product.properties_data === 'string' 
                ? JSON.parse(product.properties_data) 
                : product.properties_data;
              
              Object.keys(properties).forEach(key => {
                // Исключаем служебные поля
                if (!['photos', 'id', 'created_at', 'updated_at'].includes(key)) {
                  allProperties.add(key);
                }
              });
            } catch (error) {
              console.error('Error parsing properties_data:', error);
            }
          }
        });
        
        setExistingProductProperties(Array.from(allProperties).sort());
        console.log('Loaded existing properties:', Array.from(allProperties));
      } else {
        setExistingProductProperties([]);
      }
    } catch (error) {
      console.error('Error loading existing product properties:', error);
      setExistingProductProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  };

  const loadCatalogCategories = async () => {
    try {
      console.log('🔄 Загружаем категории для импорта...');
      const response = await fetch('/api/catalog/categories-flat');
      const data = await response.json();
      
      console.log('📦 Ответ API категорий:', data);
      
      // Используем данные напрямую из нового API
      const categories = data.categories || [];
      
      console.log(`✅ Загружено ${categories.length} категорий`);
      console.log('Пример категории:', categories[0]);
      
      // Просто устанавливаем категории без дополнительной обработки
      setCatalogCategories(categories);
      
      console.log('📊 Категории с товарами:', categories.filter(c => c.product_count > 0).length);
      
    } catch (error) {
      console.error('Error loading catalog categories:', error);
    }
  };

  // Функция для создания CSV из данных прайса
  function createCSVFromPriceListData(rows: any[][], headers: string[]): string {
    let csvContent = '';
    csvContent += headers.map(header => `"${header.replace(/"/g, '""')}"`).join(',') + '\n';
    rows.forEach(row => {
      const csvRow = row.map(cell => {
        if (cell === null || cell === undefined) return '""';
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',');
      csvContent += csvRow + '\n';
    });
    return csvContent;
  }

  const handlePriceListUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('Файл пуст или не содержит данных');
      }
      
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1);
      
      const filteredRows = rows.filter(row => 
        row.some(cell => cell !== null && cell !== undefined && cell !== '')
      );
      
      const priceListData: PriceListData = {
        headers: headers,
        rows: filteredRows,
        totalRows: filteredRows.length
      };
      
      console.log('Загружен прайс-лист:', {
        headers: headers.length,
        rows: filteredRows.length,
        sampleData: filteredRows.slice(0, 3)
      });
      
      setPriceListData(priceListData);
      
      // Инициализируем выбранные поля и настройки
      const initialSelectedFields = new Set(headers);
      const initialFieldSettings: Record<string, any> = {};
      
      headers.forEach(header => {
        // Автодетект типа данных на основе содержимого ячеек
        let detectedType: 'text' | 'number' | 'select' | 'boolean' | 'image' = 'text';
        let isRequired = false;
        
        // Анализируем первые несколько строк для определения типа
        const sampleValues = filteredRows.slice(0, 10).map(row => {
          const headerIndex = headers.indexOf(header);
          return row[headerIndex];
        }).filter(val => val !== null && val !== undefined && val !== '');
        
        if (sampleValues.length > 0) {
          // Проверяем, является ли числом
          const numericValues = sampleValues.filter(val => {
            const str = String(val).trim();
            return !isNaN(Number(str)) && str !== '';
          });
          
          if (numericValues.length === sampleValues.length) {
            detectedType = 'number';
          }
          // Проверяем, является ли булевым значением
          else if (sampleValues.every(val => {
            const str = String(val).toLowerCase().trim();
            return ['да', 'нет', 'true', 'false', '1', '0', 'да/нет'].includes(str);
          })) {
            detectedType = 'boolean';
          }
          // Проверяем, является ли URL изображения
          else if (sampleValues.every(val => {
            const str = String(val).toLowerCase().trim();
            return str.startsWith('http') && (str.includes('.jpg') || str.includes('.png') || str.includes('.jpeg') || str.includes('.gif'));
          })) {
            detectedType = 'image';
          }
          // Проверяем, является ли списком (ограниченное количество уникальных значений)
          else if (new Set(sampleValues).size <= Math.min(10, sampleValues.length * 0.5)) {
            detectedType = 'select';
          }
        }
        
        // Определяем обязательность по названию поля
        const headerLower = header.toLowerCase();
        if (headerLower.includes('название') || headerLower.includes('модель') || 
            headerLower.includes('артикул') || headerLower.includes('цена') || 
            headerLower.includes('стоимость')) {
          isRequired = true;
        }
        
        initialFieldSettings[header] = {
          displayName: header,
          isRequired,
          dataType: detectedType
        };
      });
      
      setSelectedFields(initialSelectedFields);
      setFieldSettings(initialFieldSettings);
      setCompletedSteps(prev => [...prev, 'upload']);
      setCurrentStep('catalog');
      
    } catch (error) {
      console.error('Error processing price list:', error);
      alert('Ошибка при обработке файла: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleCatalogCategorySelect = (categoryId: string) => {
    setSelectedCatalogCategoryId(categoryId);
  };

  const handleCatalogComplete = async () => {
    setCompletedSteps(prev => [...prev, 'catalog']);
    
    // Загружаем шаблон для выбранной категории
    if (selectedCatalogCategoryId) {
      await loadTemplate(selectedCatalogCategoryId);
    }
    
    // Анализируем файл для получения заголовков
    if (priceListData) {
      try {
        // Создаем временный файл из данных для анализа
        const csvContent = [
          priceListData.headers.join(','),
          ...priceListData.rows.slice(0, 10).map(row => row.join(','))
        ].join('\n');
        
        const tempFile = new File([csvContent], 'temp.csv', { type: 'text/csv' });
        const analysis = await analyzeFile(tempFile);
        setFileHeaders(analysis.headers);
      } catch (error) {
        console.error('Ошибка анализа файла:', error);
      }
    }
    
    setCurrentStep('mapping');
  };

  const handleMappingComplete = (mappings: any[]) => {
    console.log('🎯 handleMappingComplete вызван с mappings:', mappings);
    console.log('🎯 template:', template);
    console.log('🎯 mappings.length:', mappings.length);
    
    setFieldMappings(mappings);
    setCompletedSteps(prev => [...prev, 'mapping']);
    
    // Если есть шаблон и маппинги, переходим к properties для автоматической обработки
    if (template && mappings.length > 0) {
      console.log('✅ Есть шаблон и маппинги, переходим к properties');
      setCurrentStep('properties');
    } else {
      console.log('❌ Нет шаблона или маппингов, переходим к properties для создания');
      // Если шаблона нет, переходим к созданию properties
      setCurrentStep('properties');
    }
  };

  const handlePropertiesComplete = useCallback(async (fields: any[]) => {
    console.log('🚀🚀🚀 === handlePropertiesComplete ВЫЗВАН === 🚀🚀🚀');
    console.log('fields:', fields);
    console.log('fieldMappings:', fieldMappings);
    console.log('selectedCatalogCategoryId:', selectedCatalogCategoryId);
    console.log('priceListData:', priceListData);
    console.log('template:', template);
    
    // Используем поля из маппинга, если они есть, иначе из fields
    const finalFields = fieldMappings.length > 0 
      ? fieldMappings.map((mapping: any) => ({
          fieldName: mapping.templateField.fieldName,
          displayName: mapping.templateField.displayName,
          dataType: mapping.templateField.dataType,
          isRequired: mapping.templateField.isRequired,
          mappedToFileField: mapping.fileHeader?.name
        }))
      : fields;
    
    setRequiredFields(finalFields);
    
    setShowProgressModal(true);
    setProgressMessage('Сохранение товаров в базу данных...');
    
    try {
      if (!selectedCatalogCategoryId) {
        alert('Ошибка: Категория каталога не выбрана. Невозможно сохранить данные.');
        setShowProgressModal(false);
        return;
      }

      console.log('Сохранение товаров и свойств в БД...');
      console.log('selectedCatalogCategoryId:', selectedCatalogCategoryId);
      console.log('finalFields:', finalFields);
      console.log('priceListData:', priceListData);

      setProgressMessage('Создание файла данных...');
      const csvData = createCSVFromPriceListData(priceListData?.rows || [], priceListData?.headers || []);
      console.log('CSV данные созданы, размер:', csvData.length);
      
      const csvBlob = new Blob([csvData], { type: 'text/csv' });
      const csvFile = new File([csvBlob], 'price_list.csv', { type: 'text/csv' });
      
      setProgressMessage('Отправка данных на сервер...');
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('category', selectedCatalogCategoryId);
      
      // Добавляем информацию о маппинге или полях
      if (fieldMappings.length > 0) {
        console.log('Отправляем с маппингом:', fieldMappings);
        formData.append('mapping', JSON.stringify(fieldMappings));
        // Если есть шаблон, передаем его ID
        if (template?.id) {
          formData.append('templateId', template.id);
        }
      } else {
        console.log('Отправляем с полями:', fields);
        formData.append('fields', JSON.stringify(fields));
      }
      formData.append('mode', 'full');
      
      console.log('Отправляем данные на /api/admin/import/universal...');
      console.log('selectedCatalogCategoryId:', selectedCatalogCategoryId);
      console.log('priceListData headers:', priceListData?.headers);
      console.log('priceListData rows count:', priceListData?.rows?.length);
      
      const productsResponse = await fetch('/api/admin/import/universal', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Ответ от API импорта:', productsResponse.status, productsResponse.statusText);

      if (!productsResponse.ok) {
        const errorText = await productsResponse.text();
        console.error('Ошибка API:', errorText);
        throw new Error('Ошибка при сохранении товаров в БД: ' + errorText);
      }

      const productsResult = await productsResponse.json();
      console.log('🔍 ПОЛНЫЙ результат импорта товаров:', productsResult);
      console.log('🔍 productsResult.database_saved:', productsResult.database_saved);
      console.log('🔍 productsResult.imported:', productsResult.imported);
      console.log('🔍 productsResult.total_processed:', productsResult.total_processed);
      console.log('🔍 productsResult.failed_products:', productsResult.failed_products);
      console.log('🔍 productsResult.error_stats:', productsResult.error_stats);
      console.log('🔍 productsResult.failed_products_sample:', productsResult.failed_products_sample);
      console.log('Товары сохранены в БД:', productsResult);

      // Создаем шаблон загрузки только с выбранными полями
      const selectedFieldNames = fields.map(f => f.fieldName);
      const requiredFieldNames = fields.filter(f => f.isRequired).map(f => f.fieldName);
      
      const templateResponse = await fetch('/api/admin/import-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Шаблон для ${catalogCategories.find(c => c.id === selectedCatalogCategoryId)?.name || 'категории'}`,
          description: `Автоматически созданный шаблон загрузки`,
          catalog_category_id: selectedCatalogCategoryId,
          template_config: JSON.stringify({
            headers: selectedFieldNames,
            requiredFields: requiredFieldNames,
            fieldMappings: fields
          }),
          field_mappings: JSON.stringify(fields),
          required_fields: JSON.stringify(requiredFieldNames),
          calculator_fields: JSON.stringify(selectedFieldNames),
          export_fields: JSON.stringify(selectedFieldNames)
        }),
      });

      if (templateResponse.ok) {
        console.log('Шаблон загрузки создан');
      } else {
        console.warn('Не удалось создать шаблон загрузки');
      }
      
      const savedProductsCount = productsResult.database_saved || productsResult.imported || 0;
      const totalProcessedCount = productsResult.total_processed || productsResult.imported || 0;
      const categoryName = catalogCategories.find(c => c.id === selectedCatalogCategoryId)?.name || 'категории';
      
      console.log('🔍 ИТОГОВАЯ СТАТИСТИКА:');
      console.log('🔍 Всего обработано товаров:', totalProcessedCount);
      console.log('🔍 Сохранено в БД:', savedProductsCount);
      console.log('🔍 Не сохранено:', totalProcessedCount - savedProductsCount);
      
      if (savedProductsCount === 0) {
        console.warn('⚠️ ВНИМАНИЕ: Товары не сохранились в базу данных!');
        alert(`❌ Ошибка!\nТовары не были сохранены в базу данных.\nПроверьте логи в консоли.`);
        return;
      }
      
      // Показываем результат
      let message;
      if (totalProcessedCount > savedProductsCount) {
        const failedCount = productsResult.failed_products || 0;
        const errorStats = productsResult.error_stats || {};
        const topErrors = Object.entries(errorStats)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([error, count]) => `• ${error}: ${count} шт.`)
          .join('\n');
        
        message = `⚠️ Частичный успех!\nКатегория: ${categoryName}\nОбработано: ${totalProcessedCount} товаров\nСохранено: ${savedProductsCount} товаров\nНе сохранено: ${failedCount} товаров\n\nОсновные ошибки:\n${topErrors}\n\nПодробности в консоли браузера (F12).`;
      } else {
        message = `✅ Данные успешно сохранены!\nКатегория: ${categoryName}\nТоваров сохранено: ${savedProductsCount}\nШаблон: Используется существующий`;
      }
      
      alert(message);
      
      setCompletedSteps(prev => [...prev, 'properties']);
      setShowProgressModal(false);
      setCurrentStep('photos');
      
    } catch (error) {
      console.error('Error saving products and properties:', error);
      setShowProgressModal(false);
      alert(`Ошибка при сохранении данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }, [fieldMappings, selectedCatalogCategoryId, priceListData, template, catalogCategories]);

  // Автоматический переход через properties, если есть маппинги
  useEffect(() => {
    console.log('🔍 useEffect сработал:', {
      currentStep,
      fieldMappingsLength: fieldMappings.length,
      hasTemplate: !!template,
      templateId: template?.id
    });
    
    if (currentStep === 'properties' && fieldMappings.length > 0 && template) {
      console.log('✅ Автоматически пропускаем шаг properties, используя маппинги');
      console.log('fieldMappings:', fieldMappings);
      
      const mappedFields = fieldMappings.map((mapping: any) => ({
        fieldName: mapping.templateField.fieldName,
        displayName: mapping.templateField.displayName,
        dataType: mapping.templateField.dataType,
        isRequired: mapping.templateField.isRequired,
        mappedToFileField: mapping.fileHeader?.name
      }));
      
      console.log('🚀 Вызываем handlePropertiesComplete с mappedFields:', mappedFields);
      
      // ВАЖНО: Вызываем handlePropertiesComplete для загрузки прайса
      handlePropertiesComplete(mappedFields);
    } else {
      console.log('❌ Условие не выполнено:', {
        isPropertiesStep: currentStep === 'properties',
        hasMappings: fieldMappings.length > 0,
        hasTemplate: !!template
      });
    }
  }, [currentStep, fieldMappings, template, handlePropertiesComplete]);

  const handlePhotosComplete = async (photoFiles: File[]) => {
    const photoData: PhotoData = {
      files: photoFiles,
      totalCount: photoFiles.length
    };
    
    setPhotoData(photoData);
    
    try {
      setUploadingPhotos(true);
      const formData = new FormData();
      
      photoFiles.forEach((photo) => {
        formData.append('photos', photo);
      });
      
      formData.append('category', selectedCatalogCategoryId);
      formData.append('mapping_property', photoMappingProperty);

      console.log('Отправка фотографий...', photoFiles.length, 'файлов');
      
      const response = await fetch('/api/admin/import/photos-improved', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Фотографии загружены:', result);
      
      // Создаем детальный отчет
      let reportMessage = `📸 ЗАГРУЗКА ФОТО ЗАВЕРШЕНА!\n\n`;
      reportMessage += `📁 Загружено файлов: ${result.uploaded || 0}\n`;
      reportMessage += `🔗 Привязано к товарам: ${result.linked || 0}\n`;
      reportMessage += `❌ Ошибок: ${result.errors || 0}\n\n`;
      
      if (result.uploaded > 0) {
        reportMessage += `✅ Успешно обработано ${result.uploaded} фотографий\n`;
      }
      
      if (result.linked > 0) {
        reportMessage += `🎯 ${result.linked} товаров получили новые фото\n`;
      }
      
      if (result.errors > 0) {
        reportMessage += `⚠️ ${result.errors} файлов не удалось обработать\n`;
      }
      
      if (result.details && result.details.length > 0) {
        reportMessage += `\n📋 ДЕТАЛИ:\n`;
        result.details.forEach((detail: any, index: number) => {
          reportMessage += `${index + 1}. ${detail.fileName}: ${detail.message}\n`;
        });
      }
      
      alert(reportMessage);
      
      setCompletedSteps(prev => [...prev, 'photos']);
      setCurrentStep('complete');
      
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Ошибка при загрузке фотографий: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setUploadingPhotos(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'upload': return 'Загрузка прайс-листа';
      case 'catalog': return 'Выбор категории каталога';
      case 'mapping': return 'Сопоставление полей';
      case 'properties': return 'Настройка свойств товаров';
      case 'photos': return 'Загрузка фотографий';
      case 'complete': return 'Завершение импорта';
      default: return 'Импорт товаров';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'upload': return 'Загрузите файл с данными о товарах';
      case 'catalog': return 'Выберите категорию каталога для привязки товаров';
      case 'mapping': return 'Сопоставьте поля файла с полями шаблона';
      case 'properties': return 'Выберите поля для конфигуратора и отметьте обязательные';
      case 'photos': return 'Загрузите фотографии товаров';
      case 'complete': return 'Все данные загружены и настроены';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
  return (
    <div className="space-y-6">
            {/* Компактная область загрузки прайс-листа */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-black mb-2">Загрузка прайс-листа</h3>
                <p className="text-gray-600 mb-4 text-sm">Загрузите файл с данными о товарах</p>
                
            <input
              type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handlePriceListUpload}
              className="hidden"
                  id="price-list-upload"
            />
                <label
                  htmlFor="price-list-upload"
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded hover:bg-yellow-400 hover:text-black transition-all duration-200 cursor-pointer text-sm"
                >
                  {isProcessing ? 'Обработка...' : 'Выбрать файл'}
          </label>
                
                <p className="text-xs text-gray-500 mt-2">Форматы: .xlsx, .csv</p>
              </div>
            </div>

            {/* Отдельная кнопка загрузки товаров */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl mb-3">📸</div>
                <h3 className="text-lg font-semibold text-black mb-2">Загрузка фото товаров</h3>
                <p className="text-gray-600 mb-4 text-sm">Загрузите фотографии для привязки к товарам</p>
                
                <button
                  onClick={() => {
                    // Переходим к шагу загрузки фото
                    setCurrentStep('photos');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded hover:bg-yellow-400 hover:text-black transition-all duration-200 cursor-pointer text-sm"
                >
                  Выбрать файлы
                </button>
                
                <p className="text-xs text-gray-500 mt-2">Форматы: .jpg, .png, .gif</p>
              </div>
            </div>

          </div>
        );

      case 'catalog':
        // Фильтруем категории по поисковому запросу
        const filteredCategories = catalogCategories.filter(category =>
          category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
        );

        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <h4 className="text-lg font-medium">Выберите категорию каталога:</h4>
              
              {/* Поиск по категориям */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск по названию категории..."
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <div className="absolute right-3 top-2.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Список категорий */}
              <div className="border rounded-lg max-h-80 overflow-y-auto">
                {filteredCategories.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {categorySearchTerm ? 'Категории не найдены' : 'Загрузка категорий...'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedCatalogCategoryId === category.id
                            ? 'bg-black text-white hover:bg-gray-800'
                            : ''
                        }`}
                        onClick={() => handleCatalogCategorySelect(category.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {/* Индикатор уровня вложенности */}
                            {category.level > 0 && (
                              <div className="flex items-center space-x-1">
                                {Array.from({ length: category.level }).map((_, i) => (
                                  <div key={i} className="flex items-center">
                                    <div className="w-3 h-px bg-gray-300"></div>
                                    {i === category.level - 1 && (
                                      <div className="w-2 h-2 border-l-2 border-b-2 border-gray-300 ml-1"></div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <span className={`font-medium ${category.level > 0 ? 'text-gray-700' : 'text-gray-900'}`}>
                              {category.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${
                              selectedCatalogCategoryId === category.id 
                                ? 'text-white' 
                                : 'text-gray-500'
                            }`}>
                              {category.product_count || 0} товаров
                            </span>
                            {selectedCatalogCategoryId === category.id && (
                              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Информация о выбранной категории */}
              {selectedCatalogCategoryId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-900">
                        Выбрана категория: {catalogCategories.find(c => c.id === selectedCatalogCategoryId)?.name}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/catalog/products/import/template?catalogCategoryId=${selectedCatalogCategoryId}`);
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `template-${selectedCatalogCategoryId}.xlsx`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          } else {
                            alert('Ошибка при скачивании шаблона');
                          }
                        } catch (error) {
                          console.error('Error downloading template:', error);
                          alert('Ошибка при скачивании шаблона');
                        }
                      }}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Скачать шаблон
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep('upload')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
          </Button>
          <Button
                onClick={handleCatalogComplete}
                disabled={!selectedCatalogCategoryId}
                className={selectedCatalogCategoryId ? 'bg-black hover:bg-gray-800' : ''}
              >
                Продолжить
                <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
        );

      case 'mapping':
        return template && fileHeaders.length > 0 ? (
          <FieldMappingInterface
            templateFields={template.fieldMappings || []}
            fileHeaders={fileHeaders}
            onMappingComplete={handleMappingComplete}
            onCancel={() => setCurrentStep('catalog')}
          />
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-6">⏳</div>
            <h3 className="text-xl font-semibold text-black mb-4">Подготовка данных для сопоставления</h3>
            <p className="text-gray-600 mb-6">
              {templateLoading && 'Загружаем шаблон...'}
              {analyzing && 'Анализируем файл...'}
              {!templateLoading && !analyzing && !template && 'Шаблон не найден для данной категории'}
              {!templateLoading && !analyzing && template && fileHeaders.length === 0 && 'Не удалось проанализировать файл'}
            </p>
            
            {!templateLoading && !analyzing && !template && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-yellow-800 text-sm">
                  Для данной категории не найден шаблон импорта. 
                  Будет создан новый шаблон на основе полей файла.
                </p>
                <Button
                  onClick={() => setCurrentStep('properties')}
                  className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                >
                  Создать шаблон
                </Button>
              </div>
            )}
          </div>
        );

      case 'properties':
        // Если есть маппинги, показываем информацию о том, что они используются
        if (fieldMappings.length > 0) {
          return (
            <div className="text-center py-8">
              <div className="text-6xl mb-6">⚡</div>
              <h3 className="text-xl font-semibold text-black mb-4">Используем сопоставленные поля</h3>
              <p className="text-gray-600 mb-6">
                Поля уже сопоставлены с шаблоном на предыдущем шаге. 
                Переходим к следующему этапу...
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-gray-700 text-sm">
                  Сопоставлено полей: {fieldMappings.filter((m: any) => m.fileHeader).length} из {fieldMappings.length}
                </p>
              </div>
            </div>
          );
        }

        return priceListData ? (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Настройка свойств товаров</h4>
              <p className="text-gray-700 text-sm">
                Выберите поля из прайс-листа, которые будут использоваться в конфигураторе.
                Отметьте обязательные поля для корректной работы системы.
            </p>
          </div>

            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {/* Заголовки колонок */}
              <div className="grid grid-cols-12 gap-3 p-3 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                <div className="col-span-1">Выбрать</div>
                <div className="col-span-3">Поле в файле</div>
                <div className="col-span-3">Название в каталоге</div>
                <div className="col-span-2">Обязательное</div>
                <div className="col-span-3">Тип данных</div>
              </div>
              
              {priceListData.headers.map((header, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 p-3 border rounded-lg items-center">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      id={`field-${index}`}
                      checked={selectedFields.has(header)}
                      onChange={(e) => {
                        const newSelectedFields = new Set(selectedFields);
                        if (e.target.checked) {
                          newSelectedFields.add(header);
                        } else {
                          newSelectedFields.delete(header);
                        }
                        setSelectedFields(newSelectedFields);
                      }}
                      className="w-4 h-4 text-black"
                    />
                  </div>
                  <div className="col-span-3">
                    <label htmlFor={`field-${index}`} className="block text-sm font-medium text-gray-700">
                      {header}
                    </label>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Название в каталоге"
                      value={fieldSettings[header]?.displayName || header}
                      onChange={(e) => {
                        setFieldSettings(prev => ({
                          ...prev,
                          [header]: {
                            ...prev[header],
                            displayName: e.target.value
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center space-x-1 text-sm">
                      <input
                        type="checkbox"
                        checked={fieldSettings[header]?.isRequired || false}
                        onChange={(e) => {
                          setFieldSettings(prev => ({
                            ...prev,
                            [header]: {
                              ...prev[header],
                              isRequired: e.target.checked
                            }
                          }));
                        }}
                        className="w-3 h-3"
                      />
                      <span>Обязательное</span>
                    </label>
                  </div>
                  <div className="col-span-3">
                    <select 
                      value={fieldSettings[header]?.dataType || 'text'}
                      onChange={(e) => {
                        setFieldSettings(prev => ({
                          ...prev,
                          [header]: {
                            ...prev[header],
                            dataType: e.target.value as 'text' | 'number' | 'select' | 'boolean' | 'image'
                          }
                        }));
                      }}
                      className="w-full text-sm border rounded px-2 py-1"
                    >
                      <option value="text">Текст</option>
                      <option value="number">Число</option>
                      <option value="select">Список</option>
                      <option value="boolean">Да/Нет</option>
                      <option value="image">Изображение</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep('catalog')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <Button
                onClick={() => {
                  // Собираем только выбранные поля с их настройками
                  const fields = Array.from(selectedFields).map(header => {
                    const settings = fieldSettings[header];
                    return {
                      fieldName: header,
                      displayName: settings?.displayName || header,
                      isRequired: settings?.isRequired || false,
                      dataType: settings?.dataType || 'text'
                    };
                  });
                  
                  console.log('Собранные поля:', fields);
                  handlePropertiesComplete(fields);
                }}
              >
                Сохранить и продолжить
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
        </div>
        ) : null;

      case 'photos':
        return (
          <div className="space-y-6">
            {/* Компактная область загрузки фотографий */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl mb-3">📸</div>
                <h3 className="text-lg font-semibold text-black mb-2">Загрузка фотографий товаров</h3>
                <p className="text-gray-600 mb-4 text-sm">Загрузите фотографии для привязки к товарам</p>
                
                {/* Настройки */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
                  
                  {/* Выбор категории */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Категория
                    </label>
                    <select
                      value={selectedCatalogCategoryId}
                      onChange={(e) => setSelectedCatalogCategoryId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    >
                      <option value="">Выберите категорию...</option>
                      {catalogCategories
                        .filter(cat => cat.product_count > 0)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name} ({category.product_count} товаров)
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Выбор свойства */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Свойство для привязки
                    </label>
                    <select
                      value={photoMappingProperty}
                      onChange={(e) => setPhotoMappingProperty(e.target.value)}
                      disabled={!selectedCatalogCategoryId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent text-sm disabled:bg-gray-100"
                    >
                      <option value="">Выберите свойство...</option>
                      {(priceListData?.headers || existingProductProperties).map((property, index) => (
                        <option key={index} value={property}>
                          {property}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Краткая инструкция */}
                {selectedCatalogCategoryId && photoMappingProperty && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm mb-4 max-w-2xl mx-auto">
                    <p className="text-blue-800">
                      <strong>Привязка:</strong> Название файла (без расширения) = значение свойства "{photoMappingProperty}"
                    </p>
                  </div>
                )}

                {/* Drag & Drop зона */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all max-w-2xl mx-auto ${
                    !selectedCatalogCategoryId || !photoMappingProperty
                      ? 'border-gray-300 bg-gray-50'
                      : uploadingPhotos
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-400 bg-white hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (selectedCatalogCategoryId && photoMappingProperty && !uploadingPhotos) {
                      const files = Array.from(e.dataTransfer.files).filter(file => 
                        file.type.startsWith('image/')
                      );
                      if (files.length > 0) {
                        handlePhotosComplete(files);
                      }
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.preventDefault()}
                >
                  {uploadingPhotos ? (
                    <div className="space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">Загрузка фотографий...</h3>
                        <p className="text-blue-700 text-sm">Пожалуйста, подождите</p>
                      </div>
                    </div>
                  ) : !selectedCatalogCategoryId || !photoMappingProperty ? (
                    <div className="space-y-4">
                      <div className="text-4xl text-gray-400">📸</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-500">Настройте параметры</h3>
                        <p className="text-gray-400 text-sm">Выберите категорию и свойство для привязки</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-4xl text-blue-500">📸</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Перетащите фото сюда</h3>
                        <p className="text-gray-600 text-sm mb-4">или нажмите для выбора файлов</p>
                        
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              handlePhotosComplete(files);
                            }
                          }}
                          className="hidden"
                          id="photos-upload"
                        />
                        <label
                          htmlFor="photos-upload"
                          className="inline-flex items-center px-4 py-2 bg-black text-white rounded hover:bg-yellow-400 hover:text-black transition-all duration-200 cursor-pointer text-sm"
                        >
                          {uploadingPhotos ? 'Обработка...' : 'Выбрать файл'}
                        </label>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">Форматы: .jpg, .png, .gif</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Навигация */}
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep('properties')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <Button 
                onClick={() => {
                  setCompletedSteps(prev => [...prev, 'photos']);
                  setCurrentStep('complete');
                }}
                disabled={uploadingPhotos}
              >
                Пропустить фото
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-6">✅</div>
              <h3 className="text-xl font-semibold text-black mb-4">Импорт завершен!</h3>
              <p className="text-gray-600 mb-6">Все данные успешно загружены и настроены</p>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-black">{priceListData?.totalRows || 0}</div>
                  <div className="text-sm text-gray-600">Товаров</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-black">{priceListData?.headers.length || 0}</div>
                  <div className="text-sm text-gray-600">Свойств</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-black">{photoData?.totalCount || 0}</div>
                  <div className="text-sm text-gray-600">Фото</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setCurrentStep('upload');
                    setCompletedSteps([]);
                    setPriceListData(null);
                    setPhotoData(null);
                    setSelectedCatalogCategoryId('');
                  }}
                >
                  Импортировать еще товары
                </Button>
                <div>
                  <Button variant="secondary" onClick={() => window.location.href = '/admin/catalog'}>
                    Перейти к каталогу
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-2">Импорт товаров в каталог</h1>
          <p className="text-gray-600">Пошаговая загрузка товаров с настройкой свойств</p>
        </div>

        {/* Прогресс шагов */}
        <Card variant="base">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-black">{getStepTitle()}</h2>
                <p className="text-gray-600">{getStepDescription()}</p>
              </div>
              {currentStep !== 'upload' && (
                <Button variant="secondary" onClick={() => setCurrentStep('upload')}>
                  Начать заново
                </Button>
            )}
          </div>

            {/* Прогресс бар */}
            <div className="flex items-center space-x-4 mb-8">
              {[
                { key: 'upload', label: 'Загрузка', icon: '📊' },
                { key: 'catalog', label: 'Каталог', icon: '📁' },
                { key: 'properties', label: 'Свойства', icon: '⚙️' },
                { key: 'photos', label: 'Фото', icon: '📸' },
                { key: 'complete', label: 'Готово', icon: '✅' }
              ].map((step, index) => {
                const isActive = step.key === currentStep;
                const isCompleted = completedSteps.includes(step.key);
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isActive 
                        ? 'border-black bg-black text-white' 
                        : isCompleted 
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                    }`}>
                      <span className="text-lg">{step.icon}</span>
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-black' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {index < 4 && (
                      <div className={`w-8 h-0.5 mx-3 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Контент шага */}
            {renderStepContent()}
          </div>
        </Card>

        {/* Модальное окно прогресса */}
        {showProgressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Обработка данных</h3>
                <p className="text-gray-600">{progressMessage}</p>
            </div>
            </div>
          </div>
        )}

        {/* История импортов */}
        <Card variant="base">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">История импортов</h3>
              <Button variant="secondary" onClick={loadImportHistory} disabled={loadingHistory}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingHistory ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
            </div>
            
            <div className="space-y-3">
              {importHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">История импортов пуста</p>
              ) : (
                importHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{item.filename}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleString('ru-RU')}
                        </p>
                        </div>
            </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={item.status === 'completed' ? 'success' : 'warning'}>
                        {item.imported_count} товаров
                      </Badge>
                      {item.error_count > 0 && (
                        <Badge variant="error">
                          {item.error_count} ошибок
                        </Badge>
          )}
        </div>
                  </div>
                ))
              )}
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}