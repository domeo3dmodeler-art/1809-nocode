// components/ui/Select.tsx
// Унифицированные селекты в стиле Domeo

import React, { useId } from 'react';

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
  const generatedId = useId();
  const selectId = id || generatedId;
  
  const baseClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent";
  const errorClasses = "mt-1 block w-full px-3 py-2 border border-red-300 text-black focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent";
  const selectClasses = error ? errorClasses : baseClasses;
  
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
