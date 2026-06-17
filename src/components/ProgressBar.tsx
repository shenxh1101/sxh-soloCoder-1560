interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'green' | 'amber' | 'red' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  green: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600',
  blue: 'from-blue-500 to-blue-600',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const ProgressBar = ({
  value,
  max = 100,
  label,
  showValue = false,
  color = 'blue',
  size = 'md',
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayColor = percentage >= 90 ? 'red' : percentage >= 70 ? 'amber' : color;

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-slate-700 tabular-nums">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[displayColor]} rounded-full transition-all duration-700 ease-out ${sizeClasses[size]} relative`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
