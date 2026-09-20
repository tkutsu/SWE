import { Ring } from './Ring'

/**
 * The only reward in the app.
 *
 * Ticking something off changed a number in a sidebar nobody was looking at.
 * This says what just moved, for a second and a half, and then gets out of the
 * way. No dismiss button: anything you have to close is a cost, not a reward.
 */
export function Toast({ text, done, total }: { text: string; done: number; total: number }) {
  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-24 right-4 z-30 flex items-center gap-3 rounded-lg border border-emerald-700/60 bg-slate-900/95 px-4 py-3 shadow-lg backdrop-blur lg:bottom-6 lg:right-6"
      style={{ animation: 'toast-in 200ms ease-out' }}
    >
      <Ring done={done} total={total} size={30} />
      <span className="text-[13px] text-slate-200">{text}</span>
    </div>
  )
}
