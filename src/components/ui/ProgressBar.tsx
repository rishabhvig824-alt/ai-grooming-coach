interface ProgressBarProps {
  /** 0–100 */
  value?: number;
  /** Indeterminate animated bar when true (use during unknown-duration loading) */
  indeterminate?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value = 0,
  indeterminate = false,
  label,
  className = "",
}: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Loading"}
      className={`w-full h-1.5 bg-gray-200 rounded-full overflow-hidden ${className}`}
    >
      {indeterminate ? (
        // Smooth sliding animation — no spinners per design system
        <div className="h-full w-1/3 bg-brand-primary rounded-full animate-[slide_1.4s_ease-in-out_infinite]" />
      ) : (
        <div
          className="h-full bg-brand-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      )}
    </div>
  );
}
