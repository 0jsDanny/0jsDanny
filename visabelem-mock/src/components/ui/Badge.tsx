import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
    const variants = {
        default: 'bg-brand-100 text-brand-800 border-brand-200',
        success: 'bg-success-50 text-success-700 border-success-200 ring-1 ring-success-600/20',
        warning: 'bg-warning-50 text-warning-700 border-warning-200 ring-1 ring-warning-600/20',
        danger: 'bg-danger-50 text-danger-700 border-danger-200 ring-1 ring-danger-600/20',
        info: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-600/20',
        outline: 'bg-transparent text-slate-600 border-slate-200'
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
                variants[variant],
                className
            )}
            {...props}
        />
    );
};
