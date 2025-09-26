'use client';

import React from 'react';
import AdminLayout from '../../../../components/layout/AdminLayout';

export default function FrontendCategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout 
      title="Категории фронта" 
      subtitle="Управление категориями для отображения пользователям"
    >
      {children}
    </AdminLayout>
  );
}
