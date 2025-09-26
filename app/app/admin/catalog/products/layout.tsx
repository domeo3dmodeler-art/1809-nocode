'use client';

import React from 'react';
import AdminLayout from '../../../../components/layout/AdminLayout';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout 
      title="Товары" 
      subtitle="Управление товарами в каталоге"
    >
      {children}
    </AdminLayout>
  );
}
