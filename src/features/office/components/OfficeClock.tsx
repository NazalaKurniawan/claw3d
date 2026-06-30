import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function OfficeClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time
    setTime(new Date());

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-amber-900/40 bg-black/80 px-3 py-1.5 backdrop-blur-md shadow-lg shadow-black/50">
      <Clock size={14} className="text-amber-500/80" />
      <span className="font-mono text-[11px] font-bold tracking-widest text-amber-100/90">
        {formatTime(time)}
      </span>
    </div>
  );
}
