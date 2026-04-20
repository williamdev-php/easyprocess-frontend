"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

type GreetingKey = string;

function getHour(): number {
  return new Date().getHours();
}

function getSeasonalGreeting(): GreetingKey | null {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();

  // Christmas season (Dec 10 - Dec 31)
  if (month === 11 && day >= 10) return "christmas";

  // New Year (Jan 1-5)
  if (month === 0 && day <= 5) return "newYear";

  // Easter (approximate: March 20 - April 25)
  if ((month === 2 && day >= 20) || (month === 3 && day <= 25)) return "easter";

  // Midsummer (June 18-25)
  if (month === 5 && day >= 18 && day <= 25) return "midsummer";

  // Halloween (Oct 25 - Oct 31)
  if (month === 9 && day >= 25) return "halloween";

  // Lucia (Dec 1-13)
  if (month === 11 && day >= 1 && day <= 13) return "lucia";

  // Valborg (April 28-30)
  if (month === 3 && day >= 28) return "valborg";

  return null;
}

function getTimeOfDayKey(): string {
  const hour = getHour();

  if (hour >= 5 && hour < 9) return "earlyMorning";
  if (hour >= 9 && hour < 12) return "morning";
  if (hour >= 12 && hour < 14) return "midday";
  if (hour >= 14 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function getDayOfWeekKey(): string | null {
  const day = new Date().getDay();
  if (day === 1) return "monday";
  if (day === 5) return "friday";
  return null;
}

export function useGreeting(name: string): { greeting: string; subtitle: string } {
  const t = useTranslations("dashboardOverview.user.greetings");
  const tBase = useTranslations("dashboardOverview.user");
  const [, setTick] = useState(0);

  // Re-render every minute to keep greetings current
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const seasonal = getSeasonalGreeting();
  const timeKey = getTimeOfDayKey();
  const dayKey = getDayOfWeekKey();

  // Priority: seasonal > day-of-week special > time-of-day
  let greetingKey: string;
  let subtitleKey: string;

  if (seasonal) {
    greetingKey = `${seasonal}.greeting`;
    subtitleKey = `${seasonal}.subtitle`;
  } else if (dayKey) {
    greetingKey = `${dayKey}.greeting`;
    subtitleKey = `${dayKey}.subtitle`;
  } else {
    greetingKey = `${timeKey}.greeting`;
    subtitleKey = `${timeKey}.subtitle`;
  }

  return {
    greeting: t(greetingKey, { name }),
    subtitle: t(subtitleKey),
  };
}
