'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RiskLevel } from '@/types/clinical';

interface RiskBadgeProps {
  level: RiskLevel;
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

const getRiskConfig = (level: RiskLevel) => {
  switch (level) {
    case 'low':
      return {
        label: 'Low Risk',
        className: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
        icon: '🟢'
      };
    case 'medium':
      return {
        label: 'Medium Risk',
        className: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200',
        icon: '🟡'
      };
    case 'high':
      return {
        label: 'High Risk',
        className: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200',
        icon: '🟠'
      };
    case 'critical':
      return {
        label: 'Critical Risk',
        className: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200',
        icon: '🔴'
      };
    default:
      return {
        label: 'Unknown',
        className: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: '⚪'
      };
  }
};

export function RiskBadge({ level, score, size = 'md', showScore = true }: RiskBadgeProps) {
  const config = getRiskConfig(level);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge
      className={cn(
        config.className,
        sizeClasses[size],
        'font-medium border inline-flex items-center gap-1'
      )}
    >
      <span className="text-xs">{config.icon}</span>
      {showScore ? (
        <span>
          {score} - {config.label}
        </span>
      ) : (
        config.label
      )}
    </Badge>
  );
}