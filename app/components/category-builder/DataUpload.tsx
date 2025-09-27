'use client';

import React, { useState, useCallback } from 'react';
import { Card, Button } from '../ui';
import PropertyMapper from './PropertyMapper';
import FormulaBuilder from './FormulaBuilder';
import PhotoUploader from './PhotoUploader';
import CatalogCategorySelector from './CatalogCategorySelector';
import RequiredFieldsSelector from './RequiredFieldsSelector';
import * as XLSX from 'xlsx';

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

interface FormulaConfig {
  clientPriceFormula: string;
  discountFormula: string;
  factoryOrderFormula: string;
  defaultMargin: number;
  currency: string;
}

interface PhotoMapping {
  mappingType: 'by_sku' | 'by_order' | 'by_name';
  skuField?: string;
  nameField?: string;
  photoFiles: File[];
  mappedPhotos: Record<string, string>;
}

interface DataUploadProps {
  onPriceListLoaded: (data: PriceListData) => void;
  onPhotosLoaded: (data: PhotoData) => void;
  onComplete: () => void;
  categoryData?: any; // Данные категории для привязки к каталогу
}

type DataStep = 'upload' | 'catalog' | 'properties' | 'formulas' | 'photos' | 'complete';

export default function DataUpload({ onPriceListLoaded, onPhotosLoaded, onComplete, categoryData }: DataUploadProps) {
  const [currentStep, setCurrentStep] = useState<DataStep>('upload');
  const [priceListData, setPriceListData] = useState<PriceListData | null>(null);
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [propertyMappings, setPropertyMappings] = useState<PropertyMapping[]>([]);
  const [formulaConfig, setFormulaConfig] = useState<FormulaConfig | null>(null);
  const [photoMapping, setPhotoMapping] = useState<PhotoMapping | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCatalogCategoryId, setSelectedCatalogCategoryId] = useState<string>('');
  const [requiredFields, setRequiredFields] = useState<any[]>([]);

  const handlePriceListUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Читаем реальный файл
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Конвертируем в JSON
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('Файл пуст или не содержит данных');
      }
      
      // Первая строка - заголовки
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1); // Остальные строки - данные
      
      // Фильтруем пустые строки
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
      onPriceListLoaded(priceListData);
      setCurrentStep('catalog');
      
    } catch (error) {
      console.error('Error processing price list:', error);
      alert('Ошибка при обработке файла: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setIsProcessing(false);
    }
  }, [onPriceListLoaded]);

  const handleCatalogCategorySelect = (categoryId: string) => {
    setSelectedCatalogCategoryId(categoryId);
  };

  const handleCatalogComplete = () => {
    setCurrentStep('properties');
  };

  const handleRequiredFieldsConfigured = (fields: any[]) => {
    setRequiredFields(fields);
    setCurrentStep('formulas');
  };

  const handlePropertyMappingComplete = (mappings: PropertyMapping[]) => {
    setPropertyMappings(mappings);
    setCurrentStep('formulas');
  };

  const handleFormulaComplete = (config: FormulaConfig) => {
    setFormulaConfig(config);
    setCurrentStep('photos');
  };

  const handlePhotoMappingComplete = (mapping: PhotoMapping) => {
    setPhotoMapping(mapping);
    const photoData: PhotoData = {
      files: mapping.photoFiles,
      totalCount: mapping.photoFiles.length
    };
    setPhotoData(photoData);
    onPhotosLoaded(photoData);
    setCurrentStep('complete');
  };

  const handleComplete = () => {
    onComplete();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'upload': return 'Загрузка прайс-листа';
      case 'catalog': return 'Привязка к каталогу';
      case 'properties': return 'Настройка свойств';
      case 'formulas': return 'Настройка формул';
      case 'photos': return 'Загрузка фото';
      case 'complete': return 'Завершение';
      default: return 'Загрузка данных';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'upload': return 'Загрузите файл с данными о товарах';
      case 'catalog': return 'Выберите категорию каталога для привязки товаров';
      case 'properties': return 'Выберите поля для конфигуратора';
      case 'formulas': return 'Настройте формулы расчета цен';
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
            <div className="text-center py-12">
              <div className="text-6xl mb-6">📊</div>
              <h3 className="text-xl font-semibold text-black mb-4">Загрузка прайс-листа</h3>
              <p className="text-gray-600 mb-6">Загрузите файл с данными о товарах (XLSX, CSV)</p>
              
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handlePriceListUpload}
                className="hidden"
                id="price-list-upload"
              />
              <label
                htmlFor="price-list-upload"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-none hover:bg-yellow-400 hover:text-black transition-all duration-200 cursor-pointer"
              >
                {isProcessing ? 'Обработка...' : 'Выбрать файл'}
              </label>
              
              <p className="text-sm text-gray-500 mt-4">Поддерживаются форматы: .xlsx, .csv</p>
            </div>
          </div>
        );

      case 'catalog':
        return (
          <div className="space-y-6">
            <CatalogCategorySelector
              onCategorySelect={handleCatalogCategorySelect}
              selectedCategoryId={selectedCatalogCategoryId}
            />
            
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep('upload')}>
                ← Назад
              </Button>
              <Button 
                onClick={handleCatalogComplete}
                disabled={!selectedCatalogCategoryId}
              >
                Продолжить →
              </Button>
            </div>
          </div>
        );

      case 'properties':
        return priceListData ? (
          <RequiredFieldsSelector
            priceListHeaders={priceListData.headers}
            priceListData={priceListData.rows}
            onFieldsConfigured={handleRequiredFieldsConfigured}
            onBack={() => setCurrentStep('catalog')}
            catalogCategoryId={selectedCatalogCategoryId}
            categoryName={categoryData?.name}
          />
        ) : null;

      case 'formulas':
        return (
          <FormulaBuilder
            availableFields={priceListData?.headers || []}
            onFormulaComplete={handleFormulaComplete}
            onBack={() => setCurrentStep('properties')}
          />
        );

      case 'photos':
        return priceListData ? (
          <PhotoUploader
            priceListData={priceListData.rows.map(row => {
              const obj: any = {};
              priceListData.headers.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            })}
            priceListHeaders={priceListData.headers}
            onPhotoMappingComplete={handlePhotoMappingComplete}
            onBack={() => setCurrentStep('formulas')}
          />
        ) : null;

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-6">✅</div>
              <h3 className="text-xl font-semibold text-black mb-4">Данные успешно загружены!</h3>
              <p className="text-gray-600 mb-6">Все настройки завершены, можно переходить к следующему шагу</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-black">{priceListData?.totalRows || 0}</div>
                  <div className="text-sm text-gray-600">Товаров</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-black">{propertyMappings.length}</div>
                  <div className="text-sm text-gray-600">Свойств</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-black">{photoMapping?.photoFiles.length || 0}</div>
                  <div className="text-sm text-gray-600">Фото</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-black">{formulaConfig ? '✅' : '❌'}</div>
                  <div className="text-sm text-gray-600">Формулы</div>
                </div>
              </div>
              
              <Button variant="primary" onClick={handleComplete}>
                Продолжить в конструктор
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок шага */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-black">{getStepTitle()}</h3>
          <p className="text-gray-600">{getStepDescription()}</p>
        </div>
        {currentStep !== 'upload' && (
          <Button variant="secondary" onClick={() => setCurrentStep('upload')}>
            ← Начать заново
          </Button>
        )}
      </div>

      {/* Прогресс шагов */}
      <Card variant="base">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            {[
              { key: 'upload', label: 'Загрузка' },
              { key: 'catalog', label: 'Каталог' },
              { key: 'properties', label: 'Свойства' },
              { key: 'formulas', label: 'Формулы' },
              { key: 'photos', label: 'Фото' },
              { key: 'complete', label: 'Готово' }
            ].map((step, index) => {
              const isActive = step.key === currentStep;
              const isCompleted = ['upload', 'catalog', 'properties', 'formulas', 'photos', 'complete'].indexOf(currentStep) > index;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    isActive 
                      ? 'border-black bg-black text-white' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    <span className="text-sm">{index + 1}</span>
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-black' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < 5 && (
                    <div className={`w-6 h-0.5 mx-3 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Контент шага */}
      {renderStepContent()}
    </div>
  );
}