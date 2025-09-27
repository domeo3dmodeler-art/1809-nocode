'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, Checkbox, Select } from '../../../../components/ui';
import { FileText, Save, Plus, Trash2, Settings } from 'lucide-react';

interface ExportSetting {
  id: string;
  name: string;
  document_type: 'quote' | 'invoice' | 'order';
  configurator_category_id: string;
  fields_config: {
    show_sku: boolean;
    show_description: boolean;
    show_category: boolean;
    show_quantity: boolean;
    show_unit_price: boolean;
    show_total_price: boolean;
    custom_fields: string[];
  };
  display_options: {
    group_items: boolean;
    show_totals: boolean;
    show_tax: boolean;
    tax_rate: number;
    show_discount: boolean;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
  };
  header_config: {
    company_name: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    logo_url?: string;
  };
  footer_config: {
    terms_conditions: string;
    payment_terms: string;
    delivery_terms: string;
  };
  created_at: string;
  updated_at: string;
}

interface ConfiguratorCategory {
  id: string;
  name: string;
  slug: string;
}

export default function ExportSettingsPage() {
  const [exportSettings, setExportSettings] = useState<ExportSetting[]>([]);
  const [configuratorCategories, setConfiguratorCategories] = useState<ConfiguratorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSetting, setEditingSetting] = useState<ExportSetting | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/configurator/export-settings'),
        fetch('/api/frontend-categories')
      ]);

      const settingsData = await settingsResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (settingsData.success) {
        setExportSettings(settingsData.settings || []);
      }

      if (categoriesData.success) {
        setConfiguratorCategories(categoriesData.categories || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSetting = async (data: Partial<ExportSetting>) => {
    try {
      const response = await fetch('/api/configurator/export-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        await loadData();
        setShowCreateDialog(false);
      } else {
        alert('Ошибка при создании настройки: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating export setting:', error);
      alert('Ошибка при создании настройки');
    }
  };

  const handleUpdateSetting = async (id: string, data: Partial<ExportSetting>) => {
    try {
      const response = await fetch(`/api/configurator/export-settings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        await loadData();
        setEditingSetting(null);
      } else {
        alert('Ошибка при обновлении настройки: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating export setting:', error);
      alert('Ошибка при обновлении настройки');
    }
  };

  const handleDeleteSetting = async (id: string) => {
    if (!confirm('Удалить настройку экспорта?')) return;

    try {
      const response = await fetch(`/api/configurator/export-settings/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        await loadData();
      } else {
        alert('Ошибка при удалении настройки: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting export setting:', error);
      alert('Ошибка при удалении настройки');
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      quote: 'Коммерческое предложение',
      invoice: 'Счет на оплату',
      order: 'Заказ поставщику'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getDocumentTypeColor = (type: string) => {
    const colors = {
      quote: 'bg-blue-100 text-blue-800',
      invoice: 'bg-green-100 text-green-800',
      order: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка настроек экспорта...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Настройки экспорта</h1>
          <p className="text-gray-600">
            Управление настройками экспорта документов для конфигураторов
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать настройку
        </Button>
      </div>

      {/* Список настроек */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exportSettings.map(setting => (
          <Card key={setting.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{setting.name}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getDocumentTypeColor(setting.document_type)}>
                    {getDocumentTypeLabel(setting.document_type)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Категория: {configuratorCategories.find(c => c.id === setting.configurator_category_id)?.name || 'Неизвестно'}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSetting(setting)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSetting(setting.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Поля:</span>
                <span>
                  {Object.entries(setting.fields_config)
                    .filter(([key, value]) => key !== 'custom_fields' && value)
                    .length + setting.fields_config.custom_fields.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Группировка:</span>
                <span>{setting.display_options.group_items ? 'Включена' : 'Отключена'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Налог:</span>
                <span>{setting.display_options.show_tax ? `${setting.display_options.tax_rate}%` : 'Не указан'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Создано: {new Date(setting.created_at).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {exportSettings.length === 0 && (
        <Card className="p-8">
          <div className="text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Настройки экспорта не найдены</p>
            <p className="text-sm text-gray-400 mb-4">
              Создайте настройки экспорта для ваших конфигураторов
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать первую настройку
            </Button>
          </div>
        </Card>
      )}

      {/* Диалог создания/редактирования */}
      {(showCreateDialog || editingSetting) && (
        <ExportSettingDialog
          open={showCreateDialog || !!editingSetting}
          onOpenChange={(open) => {
            if (!open) {
              setShowCreateDialog(false);
              setEditingSetting(null);
            }
          }}
          onSubmit={editingSetting ? 
            (data) => handleUpdateSetting(editingSetting.id, data) :
            handleCreateSetting
          }
          setting={editingSetting}
          configuratorCategories={configuratorCategories}
        />
      )}
    </div>
  );
}

// Диалог создания/редактирования настройки экспорта
function ExportSettingDialog({
  open,
  onOpenChange,
  onSubmit,
  setting,
  configuratorCategories
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  setting?: ExportSetting | null;
  configuratorCategories: ConfiguratorCategory[];
}) {
  const [formData, setFormData] = useState({
    name: '',
    document_type: 'quote' as 'quote' | 'invoice' | 'order',
    configurator_category_id: '',
    fields_config: {
      show_sku: true,
      show_description: true,
      show_category: true,
      show_quantity: true,
      show_unit_price: true,
      show_total_price: true,
      custom_fields: [] as string[]
    },
    display_options: {
      group_items: true,
      show_totals: true,
      show_tax: false,
      tax_rate: 20,
      show_discount: false,
      discount_type: 'percentage' as 'percentage' | 'fixed',
      discount_value: 0
    },
    header_config: {
      company_name: '',
      company_address: '',
      company_phone: '',
      company_email: '',
      logo_url: ''
    },
    footer_config: {
      terms_conditions: '',
      payment_terms: '',
      delivery_terms: ''
    }
  });

  useEffect(() => {
    if (setting) {
      setFormData({
        name: setting.name,
        document_type: setting.document_type,
        configurator_category_id: setting.configurator_category_id,
        fields_config: setting.fields_config,
        display_options: setting.display_options,
        header_config: setting.header_config,
        footer_config: setting.footer_config
      });
    } else {
      setFormData({
        name: '',
        document_type: 'quote',
        configurator_category_id: '',
        fields_config: {
          show_sku: true,
          show_description: true,
          show_category: true,
          show_quantity: true,
          show_unit_price: true,
          show_total_price: true,
          custom_fields: []
        },
        display_options: {
          group_items: true,
          show_totals: true,
          show_tax: false,
          tax_rate: 20,
          show_discount: false,
          discount_type: 'percentage',
          discount_value: 0
        },
        header_config: {
          company_name: '',
          company_address: '',
          company_phone: '',
          company_email: '',
          logo_url: ''
        },
        footer_config: {
          terms_conditions: '',
          payment_terms: '',
          delivery_terms: ''
        }
      });
    }
  }, [setting, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {setting ? 'Редактировать настройку' : 'Создать настройку экспорта'}
          </h2>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ×
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основные настройки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название настройки</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Тип документа</label>
              <Select
                value={formData.document_type}
                onValueChange={(value: 'quote' | 'invoice' | 'order') => 
                  setFormData({ ...formData, document_type: value })
                }
              >
                <option value="quote">Коммерческое предложение</option>
                <option value="invoice">Счет на оплату</option>
                <option value="order">Заказ поставщику</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Категория конфигуратора</label>
            <Select
              value={formData.configurator_category_id}
              onValueChange={(value) => 
                setFormData({ ...formData, configurator_category_id: value })
              }
            >
              <option value="">Выберите категорию</option>
              {configuratorCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Настройки полей */}
          <div>
            <h3 className="text-lg font-medium mb-3">Отображаемые поля</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(formData.fields_config)
                .filter(([key]) => key !== 'custom_fields')
                .map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <Checkbox
                      checked={value as boolean}
                      onCheckedChange={(checked) => 
                        setFormData({
                          ...formData,
                          fields_config: {
                            ...formData.fields_config,
                            [key]: checked
                          }
                        })
                      }
                    />
                    <span className="text-sm">
                      {key === 'show_sku' ? 'Артикул' :
                       key === 'show_description' ? 'Описание' :
                       key === 'show_category' ? 'Категория' :
                       key === 'show_quantity' ? 'Количество' :
                       key === 'show_unit_price' ? 'Цена за единицу' :
                       key === 'show_total_price' ? 'Общая сумма' : key}
                    </span>
                  </label>
                ))}
            </div>
          </div>

          {/* Настройки отображения */}
          <div>
            <h3 className="text-lg font-medium mb-3">Настройки отображения</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.display_options.group_items}
                    onCheckedChange={(checked) => 
                      setFormData({
                        ...formData,
                        display_options: {
                          ...formData.display_options,
                          group_items: checked as boolean
                        }
                      })
                    }
                  />
                  <span className="text-sm">Группировать товары</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.display_options.show_totals}
                    onCheckedChange={(checked) => 
                      setFormData({
                        ...formData,
                        display_options: {
                          ...formData.display_options,
                          show_totals: checked as boolean
                        }
                      })
                    }
                  />
                  <span className="text-sm">Показывать итоги</span>
                </label>
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.display_options.show_tax}
                    onCheckedChange={(checked) => 
                      setFormData({
                        ...formData,
                        display_options: {
                          ...formData.display_options,
                          show_tax: checked as boolean
                        }
                      })
                    }
                  />
                  <span className="text-sm">Показывать налог</span>
                </label>
                {formData.display_options.show_tax && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Ставка налога (%)</label>
                    <Input
                      type="number"
                      value={formData.display_options.tax_rate}
                      onChange={(e) => 
                        setFormData({
                          ...formData,
                          display_options: {
                            ...formData.display_options,
                            tax_rate: parseFloat(e.target.value) || 0
                          }
                        })
                      }
                      min="0"
                      max="100"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Настройки заголовка */}
          <div>
            <h3 className="text-lg font-medium mb-3">Настройки заголовка</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название компании</label>
                <Input
                  value={formData.header_config.company_name}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      header_config: {
                        ...formData.header_config,
                        company_name: e.target.value
                      }
                    })
                  }
                  placeholder="Введите название компании"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Адрес</label>
                <Input
                  value={formData.header_config.company_address}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      header_config: {
                        ...formData.header_config,
                        company_address: e.target.value
                      }
                    })
                  }
                  placeholder="Введите адрес"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Телефон</label>
                <Input
                  value={formData.header_config.company_phone}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      header_config: {
                        ...formData.header_config,
                        company_phone: e.target.value
                      }
                    })
                  }
                  placeholder="Введите телефон"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.header_config.company_email}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      header_config: {
                        ...formData.header_config,
                        company_email: e.target.value
                      }
                    })
                  }
                  placeholder="Введите email"
                />
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {setting ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
