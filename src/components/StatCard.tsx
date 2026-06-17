import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'amber' | 'green' | 'red' | 'purple';
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100 text-blue-600',
    ring: 'ring-blue-500/20',
  },
  amber: {
    bg: 'from-amber-500 to-amber-600',
    iconBg: 'bg-amber-100 text-amber-600',
    ring: 'ring-amber-500/20',
  },
  green: {
    bg: 'from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-100 text-emerald-600',
    ring: 'ring-emerald-500/20',
  },
  red: {
    bg: 'from-red-500 to-red-600',
    iconBg: 'bg-red-100 text-red-600',
    ring: 'ring-red-500/20',
  },
  purple: {
    bg: 'from-violet-500 to-violet-600',
    iconBg: 'bg-violet-100 text-violet-600',
    ring: 'ring-violet-500/20',
  },
};

const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) => {
  const colors = colorClasses[color];

  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
      <div
        className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${colors.bg} opacity-5 rounded-full group-hover:opacity-10 group-hover:scale-110 transition-all duration-500`}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center ring-4 ${colors.ring}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                trend.isPositive ?? true
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {(trend.isPositive ?? true) ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>

        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-800 tabular-nums tracking-tight">{value}</p>
        {trend && <p className="text-xs text-slate-400 mt-2">{trend.label}</p>}
      </div>
    </div>
  );
};

export default StatCard;
