// components/ui/Select.tsx
// Унифицированные селекты в стиле Domeo

import React, { useId } from 'react';
import { createComponentStyles } from '../../lib/design/tokens';

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
  const styles = createComponentStyles();
  
  const selectClasses = error ? styles.input.error : styles.input.base;
  
  return (
    <div className={styles.form.field}>
      {label && (
        <label 
          htmlFor={selectId}
          className={styles.input.label}
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
        <p className={styles.input.errorText}>{error}</p>
      )}
      
      {helperText && !error && (
        <p className={styles.input.helper}>{helperText}</p>
      )}
    </div>
  );
}

// Экспорт для удобства
export default Select;
