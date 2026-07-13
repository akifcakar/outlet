"use client";

import { useEffect, useState } from "react";

// 05.5 — the stock hold shown as calm text, never a giant red countdown.
// Honest information styled honestly: amber under 2 minutes, aria-live warned.
export function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const [msLeft, setMsLeft] = useState(() => +new Date(expiresAt) - Date.now());

  useEffect(() => {
    const t = setInterval(
      () => setMsLeft(+new Date(expiresAt) - Date.now()),
      1000,
    );
    return () => clearInterval(t);
  }, [expiresAt]);

  if (msLeft <= 0) {
    return (
      <p role="alert" className="text-sm font-semibold text-ink">
        Süre doldu. Ürün hâlâ müsaitse yeniden ayırabilirsin — sayfayı yenile.
      </p>
    );
  }

  const m = Math.floor(msLeft / 60_000);
  const s = Math.floor((msLeft % 60_000) / 1000);
  const urgent = msLeft < 2 * 60_000;

  return (
    <p
      aria-live="polite"
      className={`price text-sm ${urgent ? "font-semibold text-amber-600 dark:text-amber-500" : "text-ink-secondary"}`}
    >
      Bu ürün senin için ayrıldı — {m}:{String(s).padStart(2, "0")}
    </p>
  );
}
