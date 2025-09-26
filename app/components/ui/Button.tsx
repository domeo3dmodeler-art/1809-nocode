// components/ui/Button.tsx
// Унифицированные кнопки в стиле Domeo

import React from 'react';

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
  // Базовые стили в соответствии со скриншотом
  const baseClasses = {
    primary: 'bg-black text-white border border-black hover:bg-yellow-400 hover:text-black transition-all duration-200 font-medium',
    secondary: 'bg-transparent border border-black text-black hover:bg-black hover:text-white transition-all duration-200 font-medium',
    ghost: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium',
    compact: 'bg-gray-600 text-white border border-gray-600 hover:bg-gray-700 transition-all duration-200 font-medium'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      className={`${baseClasses[variant]} ${sizeClasses[size]} rounded-none ${className}`}
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
