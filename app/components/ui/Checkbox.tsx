'use client';

import React, { useId } from 'react';
import { createComponentStyles } from '../../lib/design/tokens';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  children?: React.ReactNode;
}

export function Checkbox({ 
  label, 
  error, 
  helperText, 
  children,
  className = '',
  id,
  ...props 
}: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id || generatedId;
  const styles = createComponentStyles();
  
  return (
    <div className={styles.form.field}>
      <label 
        htmlFor={checkboxId}
        className="flex items-center cursor-pointer"
      >
        <input
          id={checkboxId}
          type="checkbox"
          className={`h-4 w-4 text-black focus:ring-yellow-400 border-gray-300 rounded ${className}`}
          {...props}
        />
        {(label || children) && (
          <span className="ml-2 text-sm text-black">
            {label || children}
          </span>
        )}
      </label>
      
      {error && (
        <p className={styles.input.errorText}>{error}</p>
      )}
      
      {helperText && !error && (
        <p className={styles.input.helper}>{helperText}</p>
      )}
    </div>
  );
}

export default Checkbox;
