"use client";

import { useEffect, useRef, useState } from "react";

interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

function useCountUp(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);

  return count;
}

function StatCard({ item, animate }: { item: StatItem; animate: boolean }) {
  const count = useCountUp(item.value, 2000, animate);

  return (
    <div className="text-center">
      <div className="text-4xl font-extrabold text-primary-deep lg:text-5xl">
        {animate ? count.toLocaleString() : "0"}
        {item.suffix ?? ""}
      </div>
      <div className="mt-2 text-sm font-medium text-text-muted">
        {item.label}
      </div>
    </div>
  );
}

export default function StatsCounter({ items }: { items: StatItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {items.map((item) => (
            <StatCard key={item.label} item={item} animate={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}
