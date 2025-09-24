'use client';

import React, { useState, useRef } from 'react';
import { Card, Button, Select } from '../ui';

interface PhotoMapping {
  mappingType: 'by_sku' | 'by_order' | 'by_name';
  skuField?: string;
  nameField?: string;
  photoFiles: File[];
  mappedPhotos: Record<string, string>;
}

interface PhotoUploaderProps {
  priceListData: any[];
  priceListHeaders: string[];
  onPhotoMappingComplete: (mapping: PhotoMapping) => void;
  onBack: () => void;
}

export default function PhotoUploader({ 
  priceListData, 
  priceListHeaders, 
  onPhotoMappingComplete, 
  onBack 
}: PhotoUploaderProps) {
  const [mapping, setMapping] = useState<PhotoMapping>({
    mappingType: 'by_sku',
    photoFiles: [],
    mappedPhotos: {}
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMapping(prev => ({ ...prev, photoFiles: files }));
  };

  const processPhotoMapping = async () => {
    setIsProcessing(true);
    
    try {
      const mappedPhotos: Record<string, string> = {};
      
      switch (mapping.mappingType) {
        case 'by_sku':
          if (mapping.skuField) {
            // Связка по артикулу поставщика
            priceListData.forEach((row, index) => {
              const sku = row[mapping.skuField!];
              if (sku && mapping.photoFiles[index]) {
                const photoUrl = URL.createObjectURL(mapping.photoFiles[index]);
                mappedPhotos[sku] = photoUrl;
              }
            });
          }
          break;
          
        case 'by_order':
          // Связка по порядку строк
          priceListData.forEach((row, index) => {
            if (mapping.photoFiles[index]) {
              const photoUrl = URL.createObjectURL(mapping.photoFiles[index]);
              mappedPhotos[`row_${index}`] = photoUrl;
            }
          });
          break;
          
        case 'by_name':
          if (mapping.nameField) {
            // Связка по названию товара
            priceListData.forEach((row, index) => {
              const name = row[mapping.nameField!];
              if (name && mapping.photoFiles[index]) {
                const photoUrl = URL.createObjectURL(mapping.photoFiles[index]);
                mappedPhotos[name] = photoUrl;
              }
            });
          }
          break;
      }
      
      setMapping(prev => ({ ...prev, mappedPhotos }));
      
      // Имитация обработки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error processing photos:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    onPhotoMappingComplete(mapping);
  };

  const getMappingDescription = () => {
    switch (mapping.mappingType) {
      case 'by_sku':
        return 'Фото будут связаны с товарами по артикулу поставщика. Например: door-001.jpg → артикул "door-001"';
      case 'by_order':
        return 'Фото будут связаны с товарами по порядку строк в прайсе. Первое фото → первая строка, второе фото → вторая строка';
      case 'by_name':
        return 'Фото будут связаны с товарами по названию. Система попытается найти совпадения в названиях файлов и товаров';
      default:
        return '';
    }
  };

  const getPreviewData = () => {
    const previewCount = Math.min(5, priceListData.length);
    return priceListData.slice(0, previewCount);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-black">Загрузка и связка фото</h3>
          <p className="text-gray-600">Загрузите фотографии товаров и настройте их связку с данными</p>
        </div>
        <Button variant="secondary" onClick={onBack}>
          ← Назад
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-black">{priceListData.length}</div>
          <div className="text-sm text-gray-600">Товаров в прайсе</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-black">{mapping.photoFiles.length}</div>
          <div className="text-sm text-gray-600">Загружено фото</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-black">{Object.keys(mapping.mappedPhotos).length}</div>
          <div className="text-sm text-gray-600">Связано фото</div>
        </div>
      </div>

      {/* Загрузка файлов */}
      <Card variant="base">
        <div className="p-6">
          <h4 className="font-medium text-black mb-4">📸 Загрузка фотографий</h4>
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                variant="secondary" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                Выбрать фотографии ({mapping.photoFiles.length})
              </Button>
            </div>
            
            {mapping.photoFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {mapping.photoFiles.slice(0, 8).map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                      {file.name}
                    </div>
                  </div>
                ))}
                {mapping.photoFiles.length > 8 && (
                  <div className="flex items-center justify-center h-20 bg-gray-100 rounded border text-gray-500">
                    +{mapping.photoFiles.length - 8} еще
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Настройка связки */}
      <Card variant="base">
        <div className="p-6">
          <h4 className="font-medium text-black mb-4">🔗 Настройка связки фото с товарами</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Способ связки</label>
              <Select
                value={mapping.mappingType}
                onChange={(e) => setMapping(prev => ({ 
                  ...prev, 
                  mappingType: e.target.value as PhotoMapping['mappingType'] 
                }))}
                options={[
                  { value: 'by_sku', label: 'По артикулу поставщика' },
                  { value: 'by_order', label: 'По порядку строк' },
                  { value: 'by_name', label: 'По названию товара' }
                ]}
              />
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">{getMappingDescription()}</p>
            </div>
            
            {mapping.mappingType === 'by_sku' && (
              <div>
                <label className="block text-sm text-gray-600 mb-2">Поле с артикулом поставщика</label>
                <Select
                  value={mapping.skuField || ''}
                  onChange={(e) => setMapping(prev => ({ ...prev, skuField: e.target.value }))}
                  options={[
                    { value: '', label: 'Выберите поле' },
                    ...priceListHeaders.map(header => ({ value: header, label: header }))
                  ]}
                />
              </div>
            )}
            
            {mapping.mappingType === 'by_name' && (
              <div>
                <label className="block text-sm text-gray-600 mb-2">Поле с названием товара</label>
                <Select
                  value={mapping.nameField || ''}
                  onChange={(e) => setMapping(prev => ({ ...prev, nameField: e.target.value }))}
                  options={[
                    { value: '', label: 'Выберите поле' },
                    ...priceListHeaders.map(header => ({ value: header, label: header }))
                  ]}
                />
              </div>
            )}
            
            <Button 
              variant="primary" 
              onClick={processPhotoMapping}
              disabled={mapping.photoFiles.length === 0 || isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Обработка...' : 'Обработать связку'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Предпросмотр связки */}
      {Object.keys(mapping.mappedPhotos).length > 0 && (
        <Card variant="base">
          <div className="p-6">
            <h4 className="font-medium text-black mb-4">👁️ Предпросмотр связки</h4>
            <div className="space-y-3">
              {getPreviewData().map((row, index) => {
                const key = mapping.mappingType === 'by_sku' ? row[mapping.skuField!] :
                           mapping.mappingType === 'by_name' ? row[mapping.nameField!] :
                           `row_${index}`;
                const photoUrl = mapping.mappedPhotos[key];
                
                return (
                  <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded">
                    {photoUrl ? (
                      <img src={photoUrl} alt={`Product ${index}`} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Нет фото
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-black">
                        {mapping.mappingType === 'by_sku' ? row[mapping.skuField!] :
                         mapping.mappingType === 'by_name' ? row[mapping.nameField!] :
                         `Строка ${index + 1}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {Object.keys(row).slice(0, 3).map(field => `${field}: ${row[field]}`).join(', ')}
                      </div>
                    </div>
                    <div className="text-sm">
                      {photoUrl ? (
                        <span className="text-green-600">✅ Связано</span>
                      ) : (
                        <span className="text-red-600">❌ Нет связи</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Кнопки действий */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Отмена
        </Button>
        <Button 
          variant="primary" 
          onClick={handleComplete}
          disabled={Object.keys(mapping.mappedPhotos).length === 0}
        >
          Завершить настройку ({Object.keys(mapping.mappedPhotos).length} фото)
        </Button>
      </div>
    </div>
  );
}
