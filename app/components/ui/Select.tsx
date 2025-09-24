// components/ui/Select.tsx
// Унифицированные селекты в стиле Domeo

import React from 'react';
import { createStyle } from '@/lib/design/DesignTokens';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export function Select({ 
  label, 
  error, 
  helperText, 
  options,
  placeholder,
  className = '',
  id,
  ...props 
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const selectClasses = error ? createStyle.input.error : createStyle.input.base;
  
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-black"
        >
          {label}
        </label>
      )}
      
      <select
        id={selectId}
        className={`${selectClasses} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {options && options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
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
export default Select;
