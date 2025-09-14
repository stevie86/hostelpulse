export function getNightsSaved(): number {
  if (typeof window === 'undefined') return 0
  const raw = window.localStorage.getItem('nightsSaved')
  const n = raw ? parseInt(raw, 10) : 0
  return Number.isFinite(n) ? n : 0
}

export function addNightsSaved(delta: number) {
  if (typeof window === 'undefined') return
  const current = getNightsSaved()
  const next = Math.max(0, current + (Number.isFinite(delta) ? delta : 0))
  window.localStorage.setItem('nightsSaved', String(next))
  window.dispatchEvent(new CustomEvent('nightsSavedUpdated', { detail: { value: next } }))
}

