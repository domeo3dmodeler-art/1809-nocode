// components/ui/Card.tsx
// Унифицированные карточки в стиле Domeo

import React from 'react';
import { createComponentStyles } from '../../lib/design/tokens';

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
  const styles = createComponentStyles();
  
  const baseClasses = styles.card.base;
  const variantClasses = styles.card.variants[variant];
  const paddingClasses = styles.card.padding[padding];
  
  return (
    <div
      className={`${baseClasses} ${variantClasses} ${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Экспорт для удобства
export default Card;
