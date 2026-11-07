import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  valueSuffix?: string;
}

const MetricCard = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
  onClick,
  valueSuffix,
}: MetricCardProps) => {
  const getChangeColor = () => {
    if (!change) return 'text-muted-foreground';
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (!change) return <Minus className="w-3 h-3" />;
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    return <TrendingDown className="w-3 h-3" />;
  };

  const variantStyles = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive',
  };

  return (
    <div
      className={cn(
        "metric-card group transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-95 border border-transparent hover:border-primary/20"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-lg bg-secondary', variantStyles[variant])}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', getChangeColor())}>
            {getChangeIcon()}
            <span>{Math.abs(change)}{variant === 'default' ? '' : '%'}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold text-foreground">
          {value}{valueSuffix && <span className="text-sm font-normal text-muted-foreground ml-1">{valueSuffix}</span>}
        </p>
        {changeLabel && (
          <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
