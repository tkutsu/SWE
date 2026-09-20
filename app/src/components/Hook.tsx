/**
 * The way in, for pages that have no walkthrough to open on.
 *
 * Same shape as the algorithm intro's scene: one concrete situation, in words
 * that do not assume the answer. A concept page that opens on its own title is
 * a flashcard, and nobody reads a flashcard they did not already want.
 */
export function Hook({ text }: { text?: string }) {
  if (!text) return null
  return (
    <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40">
      <p className="border-l-2 border-amber-500/70 px-4 py-3.5 text-[15px] leading-relaxed text-slate-100 sm:px-5">
        {text}
      </p>
    </div>
  )
}
