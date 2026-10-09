import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center select-none ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
          {icon}
        </div>
      )}
      <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1">{title}</h4>
      {description && <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>}
      {actionText && onAction && (
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
