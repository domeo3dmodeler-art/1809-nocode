'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge } from '../../../../components/ui';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, History, RefreshCw } from 'lucide-react';
import { CatalogImportResult } from '@/lib/types/catalog';

interface ImportHistoryItem {
  id: string;
  filename: string;
  imported_count: number;
  error_count: number;
  status: string;
  created_at: string;
}

export default function CatalogImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<CatalogImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadImportHistory();
  }, []);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
      setShowResult(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/catalog/import', {
        method: 'POST',
        body: formData
      });

      const result: CatalogImportResult = await response.json();
      setImportResult(result);
      setShowResult(true);
      
      if (result.success) {
        // Обновляем историю импортов
        await loadImportHistory();
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      setImportResult({
        success: false,
        message: 'Ошибка при загрузке файла',
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Неизвестная ошибка'],
        warnings: [],
        categories: []
      });
      setShowResult(true);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/catalog/import?action=template');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'catalog_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Завершен</Badge>;
      case 'error':
        return <Badge variant="destructive">Ошибка</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">В процессе</Badge>;
      default:
        return <Badge variant="secondary">Неизвестно</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center space-x-1"
          >
            <Download className="h-4 w-4" />
            <span>Шаблон</span>
          </Button>
          <Button
            variant="outline"
            onClick={loadImportHistory}
            disabled={loadingHistory}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </Button>
        </div>
      </div>

      {/* Загрузка файла */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Загрузить Excel файл</h2>
            <p className="text-sm text-gray-600 mb-4">
              Выберите Excel файл с деревом каталога. Файл должен содержать иерархическую структуру категорий.
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    {file ? file.name : 'Выберите файл или перетащите сюда'}
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Поддерживаются файлы Excel (.xlsx, .xls) до 10MB
                </p>
              </div>
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center space-x-1"
              >
                {uploading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{uploading ? 'Загрузка...' : 'Загрузить'}</span>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Результат импорта */}
      {showResult && importResult && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {importResult.success ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <h2 className="text-lg font-semibold">
                {importResult.success ? 'Импорт завершен' : 'Ошибка импорта'}
              </h2>
            </div>

            <p className="text-sm text-gray-600">{importResult.message}</p>

            {importResult.success && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {importResult.imported}
                  </div>
                  <div className="text-sm text-green-800">Импортировано категорий</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {importResult.errors.length}
                  </div>
                  <div className="text-sm text-red-800">Ошибок</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {importResult.warnings.length}
                  </div>
                  <div className="text-sm text-yellow-800">Предупреждений</div>
                </div>
              </div>
            )}

            {/* Ошибки */}
            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-red-800">Ошибки:</h3>
                <div className="bg-red-50 p-3 rounded-lg">
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Предупреждения */}
            {importResult.warnings.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-yellow-800">Предупреждения:</h3>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {importResult.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Импортированные категории */}
            {importResult.categories.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Импортированные категории:</h3>
                <div className="bg-gray-50 p-3 rounded-lg max-h-60 overflow-y-auto">
                  <div className="space-y-1">
                    {importResult.categories.map((category, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">L{category.level}</span>
                        <span className="font-medium">{category.name}</span>
                        {category.parent && (
                          <span className="text-gray-400">→ {category.parent}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* История импортов */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">История импортов</h2>
          </div>

          {loadingHistory ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Загрузка истории...</p>
            </div>
          ) : importHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              История импортов пуста
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Файл
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Импортировано
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ошибок
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(item.status)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {item.filename}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.imported_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.error_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Инструкции */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Инструкции по импорту</h2>
          <div className="prose prose-sm max-w-none">
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Скачайте шаблон Excel файла, нажав кнопку "Шаблон"</li>
              <li>Заполните файл согласно структуре каталога:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Каждая строка представляет одну категорию</li>
                  <li>Колонки соответствуют уровням вложенности (1-4 уровня)</li>
                  <li>Для создания подкатегории оставьте пустые ячейки в предыдущих колонках</li>
                </ul>
              </li>
              <li>Сохраните файл в формате Excel (.xlsx)</li>
              <li>Загрузите файл через форму выше</li>
              <li>Проверьте результат импорта и исправьте ошибки при необходимости</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
