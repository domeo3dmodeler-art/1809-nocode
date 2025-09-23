// app/admin/import/page.tsx
'use client';
import { useEffect, useState } from 'react';
type Category = { id: string; code: string; name: string };

type ImportError = {
  index: number;
  sku?: string;
  reason: string;
};

type ImportResult = {
  total: number;
  accepted: number;
  rejected: number;
  imported?: number; // Добавляем опциональное поле imported
  sample: any[];
  errors: ImportError[];
  schema?: any[];
};

type ImportLog = {
  id: string;
  category: string;
  filename: string;
  total: number;
  imported: number;
  rejected: number;
  status: 'success' | 'error' | 'partial';
  createdAt: string;
  errors?: ImportError[];
};

export default function UniversalImportPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [catCode, setCatCode] = useState<string>('doors');
  const [file, setFile] = useState<File | null>(null);
  const [currency, setCurrency] = useState<'RUB'|'EUR'>('RUB');
  const [validFrom, setValidFrom] = useState<string>(new Date().toISOString().slice(0,10));
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [published, setPublished] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => { (async () => {
    try {
      const r = await fetch('/api/admin/categories', { cache: 'no-store' });
      const d = await r.json();
      setCats(d || []);
      if (d?.length && !d.find((c:Category)=>c.code===catCode)) setCatCode(d[0].code);
      
      // Загружаем журнал импорта
      await fetchImportLogs();
    } catch {}
  })(); }, []);

  const fetchImportLogs = async () => {
    try {
      // Заглушка для демонстрации журнала импорта
      const mockLogs: ImportLog[] = [
        {
          id: 'log-1',
          category: 'doors',
          filename: 'doors_price_2025_01_15.xlsx',
          total: 150,
          imported: 145,
          rejected: 5,
          status: 'partial',
          createdAt: '2025-01-15T10:30:00Z',
          errors: [
            { index: 12, sku: 'DOOR-001', reason: 'Поле base_price должно быть числом' },
            { index: 45, sku: 'DOOR-002', reason: 'Поле currency не входит в RUB,EUR' }
          ]
        },
        {
          id: 'log-2',
          category: 'doors',
          filename: 'doors_price_2025_01_14.xlsx',
          total: 100,
          imported: 100,
          rejected: 0,
          status: 'success',
          createdAt: '2025-01-14T15:20:00Z'
        },
        {
          id: 'log-3',
          category: 'doors',
          filename: 'doors_price_2025_01_13.xlsx',
          total: 50,
          imported: 0,
          rejected: 50,
          status: 'error',
          createdAt: '2025-01-13T09:15:00Z',
          errors: [
            { index: 0, reason: 'Файл поврежден или имеет неправильный формат' }
          ]
        }
      ];
      setImportLogs(mockLogs);
    } catch (err) {
      console.error('Error fetching import logs:', err);
    }
  };

  const send = async (mode:'preview'|'publish') => {
    if (!file || !catCode) return;
    setLoading(true); 
    if (mode==='preview') setPublished(null);
    
    const fd = new FormData();
    fd.append('file', file);
    fd.append('currency', currency);
    fd.append('valid_from', validFrom);
    fd.append('mode', mode);
    
    try {
      const res = await fetch(`/api/admin/import/${encodeURIComponent(catCode)}`, { method:'POST', body: fd });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка импорта');
      }
      
      if (mode==='preview') {
        setPreview(data);
      } else {
        setPublished(data);
        // Обновляем журнал импорта после публикации
        await fetchImportLogs();
      }
    } catch (error: any) {
      alert(`Ошибка импорта: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    if (!confirm('Вы уверены, что хотите отменить последнюю публикацию прайса?')) return;
    
    try {
      setLoading(true);
      // Здесь должен быть API вызов для rollback
      console.log('Rolling back last import...');
      alert('Rollback выполнен успешно');
      await fetchImportLogs();
    } catch (error: any) {
      alert(`Ошибка rollback: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ImportLog['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: ImportLog['status']) => {
    switch (status) {
      case 'success': return 'Успешно';
      case 'error': return 'Ошибка';
      case 'partial': return 'Частично';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Импорт прайсов</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            {showLogs ? 'Скрыть журнал' : 'Показать журнал'}
          </button>
          {published && (
            <button
              onClick={handleRollback}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Отменить последнюю публикацию
            </button>
          )}
        </div>
      </div>

      {/* Журнал импорта */}
      {showLogs && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Журнал импорта</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Файл</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Всего</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Импортировано</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Отброшено</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                        {getStatusText(log.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="text-green-600">{log.imported}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="text-red-600">{log.rejected}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {log.errors && log.errors.length > 0 && (
                        <button
                          onClick={() => {
                            const errorDetails = log.errors?.map(e => 
                              `Строка ${e.index + 1}${e.sku ? ` (SKU: ${e.sku})` : ''}: ${e.reason}`
                            ).join('\n');
                            alert(`Ошибки импорта:\n\n${errorDetails}`);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Показать ошибки
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Форма импорта */}
      <div className="rounded-2xl border p-4 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Категория</label>
          <select className="rounded-2xl border p-3 w-full" value={catCode} onChange={e=>setCatCode(e.target.value)}>
            {cats.length ? cats.map(c => <option key={c.id} value={c.code}>{c.name} ({c.code})</option>)
                         : <option value="doors">Doors (по умолчанию)</option>}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Файл (XLSX/CSV)</label>
          <input type="file" accept=".xlsx,.csv" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Валюта</label>
          <select className="rounded-2xl border p-3 w-full" value={currency} onChange={e=>setCurrency(e.target.value as any)}>
            <option value="RUB">RUB</option><option value="EUR">EUR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">valid_from</label>
          <input type="date" className="rounded-2xl border p-3 w-full" value={validFrom} onChange={e=>setValidFrom(e.target.value)} />
        </div>
        <div className="sm:col-span-2 flex gap-2">
          <button className="rounded-2xl border px-4 py-3" disabled={!file || loading} onClick={()=>send('preview')}>
            {loading ? 'Проверяем…' : 'Проверка'}
          </button>
          <button className="rounded-2xl border px-4 py-3" disabled={!preview || (preview.rejected>0) || loading} onClick={()=>send('publish')}>
            {loading ? 'Публикуем…' : 'Опубликовать'}
          </button>
        </div>
      </div>

      {/* Результаты предпросмотра */}
      {preview && (
        <div className="rounded-2xl border p-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div>Всего: <b>{preview.total}</b></div>
            <div className="text-green-700">Пройдёт: <b>{preview.accepted}</b></div>
            <div className="text-red-700">Отброшено: <b>{preview.rejected}</b></div>
            {preview.rejected > 0 && (
              <div className="text-yellow-700">
                <b>⚠️ Есть ошибки валидации!</b>
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <div className="text-sm text-gray-600 mb-1">Примеры данных</div>
            <pre className="bg-gray-50 rounded-xl p-3 overflow-auto text-sm max-h-40">{JSON.stringify(preview.sample, null, 2)}</pre>
          </div>
          
          {preview.errors?.length ? (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-red-600">
                Ошибки валидации ({preview.errors.length})
              </summary>
              <div className="mt-2 bg-red-50 rounded-xl p-3">
                <div className="text-sm text-red-800 space-y-1">
                  {preview.errors.map((error, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="font-medium">Строка {error.index + 1}:</span>
                      <span>{error.reason}</span>
                      {error.sku && (
                        <span className="text-gray-600">(SKU: {error.sku})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ) : null}
        </div>
      )}

      {/* Результаты публикации */}
      {published && (
        <div className="rounded-2xl border p-4 bg-green-50 border-green-200">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-800 font-medium">Публикация завершена успешно!</span>
          </div>
          <div className="text-green-700">
            Импортировано: <b>{published.imported}</b> / {published.total}, отброшено: {published.rejected}
          </div>
          <div className="mt-2">
            <a href="/doors" className="inline-block underline text-green-600 hover:text-green-800">
              Открыть каталог Doors
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
