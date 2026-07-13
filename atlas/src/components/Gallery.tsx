"use client";

import { useRef, useState } from "react";

// 05.4 gallery — swipeable on touch, arrows + thumbnails on desktop.
// CSS scroll-snap does the work; React only tracks the active index.
// Flaw photos stay in the main flow, labeled — transparency is the product.

export type GalleryPhoto = {
  id: string;
  url: string;
  width: number;
  height: number;
  isFlaw: boolean;
  flawLabel: string | null;
};

export function Gallery({
  photos,
  title,
  dimFirst = false,
}: {
  photos: GalleryPhoto[];
  title: string;
  dimFirst?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(i, photos.length - 1));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  if (photos.length === 0) return null;
  const active = photos[Math.min(index, photos.length - 1)];

  return (
    <div>
      <div className="group relative overflow-hidden rounded-lg border border-line bg-subtle">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${title} fotoğrafları`}
        >
          {photos.map((p, i) => (
            // snap-always: a swipe commits to exactly the next slide — no
            // gliding past, no settling halfway (the "tık" feel).
            <figure key={p.id} className="w-full shrink-0 snap-center snap-always">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={
                  p.isFlaw
                    ? `Kusur yakın çekim: ${p.flawLabel ?? ""}`
                    : `${title} — fotoğraf ${i + 1}`
                }
                width={p.width}
                height={p.height}
                loading={i === 0 ? "eager" : "lazy"}
                className={`aspect-[4/3] w-full object-cover ${dimFirst && i === 0 ? "opacity-60" : ""}`}
              />
            </figure>
          ))}
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Önceki fotoğraf"
              disabled={index === 0}
              className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-lg text-ink shadow-[var(--shadow-card-hover)] transition-opacity disabled:opacity-0 md:flex"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Sonraki fotoğraf"
              disabled={index === photos.length - 1}
              className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-lg text-ink shadow-[var(--shadow-card-hover)] transition-opacity disabled:opacity-0 md:flex"
            >
              →
            </button>
            <span
              aria-live="polite"
              className="absolute bottom-2 right-2 rounded-full bg-inverse/80 px-2.5 py-0.5 text-xs font-semibold text-ink-inverse"
            >
              {index + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {/* Active slide's flaw label — honesty stays attached to the photo */}
      {active?.isFlaw && (
        <p className="mt-2 rounded-md border border-line-strong bg-subtle px-4 py-2 text-sm text-ink-secondary">
          <span className="font-semibold text-ink">Kusur fotoğrafı:</span> {active.flawLabel}
        </p>
      )}

      {photos.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {photos.map((p, i) => (
            <li key={p.id} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={p.isFlaw ? `Kusur fotoğrafına git: ${p.flawLabel ?? i + 1}` : `Fotoğraf ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={`block overflow-hidden rounded-md border-2 ${
                  i === index
                    ? "border-[var(--border-strong)]"
                    : p.isFlaw
                      ? "border-line-strong opacity-70"
                      : "border-transparent opacity-70"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt=""
                  width={72}
                  height={54}
                  loading="lazy"
                  className="aspect-[4/3] w-[72px] object-cover"
                />
                {p.isFlaw && (
                  <span aria-hidden className="block bg-subtle text-center text-[10px] text-ink-secondary">
                    ⚠ kusur
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
