import type { Metadata } from "next";
import Link from "next/link";

// 05.1 — the trust pitch, one click away from everywhere.

export const metadata: Metadata = {
  title: "Atlas nasıl çalışır?",
  description:
    "Doğrulanmış işletmeler, Grade sistemi ve teslimata kadar güvende tutulan ödeme. Atlas'ın üç güven katmanı.",
};

const STEPS = [
  {
    title: "Kimden aldığını bil",
    body: "Atlas'ta yalnızca vergi kaydı doğrulanmış işletmeler satar. Her ilanda satıcının kimliği, şehri ve performansı açıktır. Bireysel satıcı yoktur.",
  },
  {
    title: "Ne aldığını bil",
    body: "Her ürün, ne olduğu (teşhir, açık kutu, iade...) ve ne halde olduğu (Grade A/B/C) bilgisiyle gelir. Neden indirimli olduğu her ilanda yazar; kusurlar yakın çekim fotoğraflanır.",
  },
  {
    title: "Paran güvende",
    body: "Ödemen satıcıya hemen geçmez — ürünü teslim alıp onaylayana kadar güvende tutulur. Ürün anlatıldığı gibi değilse iade kargosu bizden.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 md:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        Atlas nasıl çalışır?
      </h1>
      <p className="mt-4 text-lg text-ink-secondary">
        Atlas, teşhir ve açık kutu ürünlerin pazaryeri. Ucuz olduğu için değil,
        nedeni belli olduğu için indirimli.
      </p>

      <ol className="mt-10 space-y-6">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-semibold text-ink">
              {i + 1}. {s.title}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
              {s.body}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-[15px] text-ink-secondary">
        Grade&apos;lerin tam tanımları için{" "}
        <Link href="/grade-sistemi" className="font-semibold text-ink underline underline-offset-2">
          Grade sistemi
        </Link>{" "}
        sayfasına bak.
      </p>
    </div>
  );
}
