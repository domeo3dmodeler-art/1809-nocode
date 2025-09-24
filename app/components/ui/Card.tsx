// components/ui/Card.tsx
// Унифицированные карточки в стиле Domeo

import React from 'react';
import { createStyle } from '@/lib/design/DesignTokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'elevated' | 'interactive';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Card({ 
  variant = 'base', 
  padding = 'md', 
  children, 
  className = '',
  ...props 
}: CardProps) {
  const baseClasses = createStyle.card[variant];
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div
      className={`${baseClasses} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Экспорт для удобства
export default Card;
