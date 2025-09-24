// components/ui/Input.tsx
// Унифицированные поля ввода в стиле Domeo

import React from 'react';
import { createStyle } from '@/lib/design/DesignTokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'base' | 'error';
}

export function Input({ 
  label, 
  error, 
  helperText, 
  variant = 'base',
  className = '',
  id,
  ...props 
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const inputClasses = variant === 'error' ? createStyle.input.error : createStyle.input.base;
  
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-black"
        >
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={`${inputClasses} ${className}`}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

// Экспорт для удобства
export default Input;
