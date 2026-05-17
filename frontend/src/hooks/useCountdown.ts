import { useEffect, useRef, useState } from 'react';

type Urgency = 'green' | 'yellow' | 'red' | 'overdue';

interface UseCountdownInput {
  deadline: Date;
  createdAt: Date;
}

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  urgency: Urgency;
}

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function buildCountdown({ deadline, createdAt }: UseCountdownInput): CountdownState {
  const now = new Date();
  const remainingMs = deadline.getTime() - now.getTime();

  if (remainingMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, urgency: 'overdue' };
  }

  const totalMs = Math.max(deadline.getTime() - createdAt.getTime(), SECOND_MS);
  const percentRemaining = (remainingMs / totalMs) * 100;
  const urgency: Urgency =
    percentRemaining > 50 ? 'green' : percentRemaining > 20 ? 'yellow' : 'red';

  return {
    days: Math.floor(remainingMs / DAY_MS),
    hours: Math.floor((remainingMs % DAY_MS) / HOUR_MS),
    minutes: Math.floor((remainingMs % HOUR_MS) / MINUTE_MS),
    seconds: Math.floor((remainingMs % MINUTE_MS) / SECOND_MS),
    urgency,
  };
}

export function useCountdown(input: UseCountdownInput) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [state, setState] = useState<CountdownState>(() => buildCountdown(input));

  useEffect(() => {
    setState(buildCountdown(input));
    intervalRef.current = setInterval(() => {
      setState(buildCountdown(input));
    }, SECOND_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [input.deadline, input.createdAt]);

  return state;
}
