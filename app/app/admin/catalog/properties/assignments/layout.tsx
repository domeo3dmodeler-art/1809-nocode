'use client';

import React from 'react';
import AdminLayout from '../../../../../components/layout/AdminLayout';

export default function PropertyAssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout 
      title="Назначение свойств" 
      subtitle="Управление назначением свойств товаров категориям каталога"
    >
      {children}
    </AdminLayout>
  );
}
