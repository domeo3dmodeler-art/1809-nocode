'use client';

import React from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout 
      title="Каталог товаров" 
      subtitle="Управление деревом категорий и свойствами товаров"
    >
      {children}
    </AdminLayout>
  );
}
