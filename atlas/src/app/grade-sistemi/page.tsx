import type { Metadata } from "next";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { GRADES } from "@/lib/vocab";

// 05.1 — "the most important static page on the site": every Grade badge
// links here. Also SEO backbone content (12.5).

export const metadata: Metadata = {
  title: "Grade sistemi — A, B, C ne demek?",
  description:
    "Atlas'ta her ürün iki bilgiyle gelir: ürüne ne olduğu (durum) ve şu an ne halde olduğu (Grade). Grade A, B ve C'nin tam tanımları.",
};

export default function GradeSystemPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 md:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        Grade sistemi
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-secondary">
        Atlas&apos;ta her ürün iki soruya cevap verir:{" "}
        <strong className="text-ink">ürüne ne oldu?</strong> (durum: teşhir,
        açık kutu, iade...) ve <strong className="text-ink">şu an ne halde?</strong>{" "}
        İkincisinin cevabı Grade&apos;dir.
      </p>

      <div className="mt-10 space-y-6">
        {(Object.entries(GRADES) as [string, string][]).map(([g, desc]) => (
          <div key={g} className="flex gap-4 rounded-lg border border-line bg-surface p-5">
            <GradeBadge grade={g} />
            <div>
              <h2 className="font-semibold text-ink">Grade {g}</h2>
              <p className="mt-1 text-[15px] text-ink-secondary">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-4 text-[15px] leading-relaxed text-ink-secondary">
        <p>
          Grade B ve C ürünlerde her kusur, ilan galerisinde{" "}
          <strong className="text-ink">yakın çekim fotoğrafla ve etiketiyle</strong>{" "}
          gösterilir. Görmediğin bir kusurla karşılaşmazsın.
        </p>
        <p>
          Ürün kapına geldiğinde Grade&apos;ine uymuyorsa iade kargosu bizden,
          ödemen zaten teslimatı onaylayana kadar güvende tutulur.
        </p>
      </div>
    </div>
  );
}
