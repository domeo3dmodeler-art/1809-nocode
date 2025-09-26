'use client';

import React from 'react';
import AdminLayout from '../../../../components/layout/AdminLayout';

export default function ExportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout 
      title="Настройки экспорта" 
      subtitle="Управление настройками экспорта документов"
    >
      {children}
    </AdminLayout>
  );
}
