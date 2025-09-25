// components/ui/Input.tsx
// Унифицированные поля ввода в стиле Domeo

import React, { useId } from 'react';

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
  const generatedId = useId();
  const inputId = id || generatedId;
  
  const baseClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent";
  const errorClasses = "mt-1 block w-full px-3 py-2 border border-red-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent";
  const inputClasses = variant === 'error' ? errorClasses : baseClasses;
  
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
