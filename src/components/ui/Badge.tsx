import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'info';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = ''
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded-md font-medium gap-1',
    md: 'text-xs px-2 py-0.5 rounded-lg font-medium gap-1.5'
  };

  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    primary: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200'
  };

  return (
    <span
      className={`inline-flex items-center shrink-0 tracking-tight select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
