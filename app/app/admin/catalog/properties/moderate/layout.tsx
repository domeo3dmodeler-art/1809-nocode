'use client';

import React from 'react';
import AdminLayout from '../../../../../components/layout/AdminLayout';

export default function PropertyModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout 
      title="Модерация свойств" 
      subtitle="Назначение свойств товаров категориям каталога"
    >
      {children}
    </AdminLayout>
  );
}
