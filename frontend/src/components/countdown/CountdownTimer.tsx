import { useCountdown } from '../../hooks/useCountdown';
import { Badge } from '../ui/Badge';
import { vi } from '../../i18n/vi';

interface CountdownTimerProps {
  deadline: Date;
  createdAt: Date;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

const urgencyClass = {
  green: 'border-safe text-safe',
  yellow: 'border-warning text-warning',
  red: 'border-danger text-danger',
  overdue: 'border-overdue text-overdue',
} as const;

export function CountdownTimer({
  deadline,
  createdAt,
  size = 'md',
  compact = false,
}: CountdownTimerProps) {
  const countdown = useCountdown({ deadline, createdAt });
  const boxSize = size === 'lg' ? 'min-w-20 p-4' : size === 'sm' ? 'min-w-14 p-2' : 'min-w-16 p-3';

  if (countdown.urgency === 'overdue') {
    return <Badge className="bg-overdue text-white">{vi.urgency.overdue}</Badge>;
  }

  const items = [
    [vi.urgency.days, countdown.days],
    [vi.urgency.hours, countdown.hours],
    [vi.urgency.minutes, countdown.minutes],
    [vi.urgency.seconds, countdown.seconds],
  ] as const;

  return (
    <div className={`flex ${compact ? 'gap-1' : 'gap-2'}`} aria-live="polite">
      {items.map(([label, value]) => (
        <div
          className={`rounded-lg border bg-bg-secondary text-center ${boxSize} ${urgencyClass[countdown.urgency]}`}
          key={label}
        >
          <div className="font-mono text-lg font-bold">{value.toString().padStart(2, '0')}</div>
          {!compact && <div className="text-xs text-text-muted">{label}</div>}
        </div>
      ))}
    </div>
  );
}
