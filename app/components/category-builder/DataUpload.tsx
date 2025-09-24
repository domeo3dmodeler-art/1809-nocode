'use client';

import React, { useState, useCallback } from 'react';
import { Card, Button } from '../ui';
import PropertyMapper from './PropertyMapper';
import FormulaBuilder from './FormulaBuilder';
import PhotoUploader from './PhotoUploader';

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
}

type DataStep = 'upload' | 'properties' | 'formulas' | 'photos' | 'complete';

export default function DataUpload({ onPriceListLoaded, onPhotosLoaded, onComplete }: DataUploadProps) {
  const [currentStep, setCurrentStep] = useState<DataStep>('upload');
  const [priceListData, setPriceListData] = useState<PriceListData | null>(null);
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [propertyMappings, setPropertyMappings] = useState<PropertyMapping[]>([]);
  const [formulaConfig, setFormulaConfig] = useState<FormulaConfig | null>(null);
  const [photoMapping, setPhotoMapping] = useState<PhotoMapping | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePriceListUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Имитируем обработку файла
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Демо-данные прайс-листа с 30 столбцами
      const mockData: PriceListData = {
        headers: [
          'Артикул', 'Наименование', 'Цена', 'Размер', 'Цвет', 'Материал',
          'Тип_двери', 'Толщина', 'Ширина', 'Высота', 'Вес', 'Производитель',
          'Страна', 'Гарантия', 'Срок_поставки', 'Наличие', 'Скидка',
          'Цена_опт', 'Минимум_опт', 'Фурнитура', 'Петли', 'Ручки',
          'Замок', 'Уплотнитель', 'Утепление', 'Звукоизоляция',
          'Огнестойкость', 'Влагостойкость', 'Фото', 'Описание'
        ],
        rows: [
          [
            'DOOR-001', 'Дверь межкомнатная', '15000', '2000x800', 'Белый', 'МДФ',
            'Распашная', '40', '800', '2000', '25', 'ДвериПро',
            'Россия', '24', '7', 'В наличии', '5',
            '12000', '10', 'Золотая', 'Скрытые', 'Ручка-скоба',
            'Нет', 'Резиновый', 'Нет', 'Средняя',
            'Нет', 'Да', 'door-001.jpg', 'Качественная межкомнатная дверь'
          ],
          [
            'DOOR-002', 'Дверь входная', '25000', '2100x900', 'Коричневый', 'Металл',
            'Распашная', '50', '900', '2100', '45', 'МеталлДверь',
            'Россия', '36', '14', 'Под заказ', '10',
            '20000', '5', 'Серебряная', 'Наружные', 'Ручка-кнопка',
            'Цилиндровый', 'Магнитный', 'Да', 'Высокая',
            'Да', 'Да', 'door-002.jpg', 'Надежная входная дверь'
          ],
          [
            'DOOR-003', 'Дверь раздвижная', '18000', '2000x600', 'Серый', 'Стекло',
            'Раздвижная', '30', '600', '2000', '20', 'СтеклоДверь',
            'Италия', '12', '21', 'В наличии', '0',
            '18000', '1', 'Хром', 'Роликовые', 'Скрытая ручка',
            'Нет', 'Силиконовый', 'Нет', 'Низкая',
            'Нет', 'Нет', 'door-003.jpg', 'Стильная раздвижная дверь'
          ]
        ],
        totalRows: 3
      };
      
      setPriceListData(mockData);
      onPriceListLoaded(mockData);
      setCurrentStep('properties');
      
    } catch (error) {
      console.error('Error processing price list:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onPriceListLoaded]);

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

      case 'properties':
        return priceListData ? (
          <PropertyMapper
            priceListHeaders={priceListData.headers}
            priceListData={priceListData.rows.map(row => {
              const obj: any = {};
              priceListData.headers.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            })}
            onMappingComplete={handlePropertyMappingComplete}
            onBack={() => setCurrentStep('upload')}
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
              { key: 'upload', label: 'Загрузка', icon: '📊' },
              { key: 'properties', label: 'Свойства', icon: '⚙️' },
              { key: 'formulas', label: 'Формулы', icon: '🧮' },
              { key: 'photos', label: 'Фото', icon: '📸' },
              { key: 'complete', label: 'Готово', icon: '✅' }
            ].map((step, index) => {
              const isActive = step.key === currentStep;
              const isCompleted = ['upload', 'properties', 'formulas', 'photos', 'complete'].indexOf(currentStep) > index;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    isActive 
                      ? 'border-black bg-black text-white' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    <span className="text-sm">{step.icon}</span>
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-black' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < 4 && (
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