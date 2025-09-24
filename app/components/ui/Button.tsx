// components/ui/Button.tsx
// Унифицированные кнопки в стиле Domeo

import React from 'react';
import { createStyle } from '@/lib/design/DesignTokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  children, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = createStyle.button[variant];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Загрузка...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Экспорт для удобства
export default Button;
