/**
 * Tiempo is fully driven by the backend: the only valid (anio, bimestre) pairs
 * are the ones returned by /api/anios and /api/bimestres. See Tiempo.Hooks.
 *
 * This file only re-exports the Bimestre type/labels from the local bimestre
 * helper, which stay valid as a UI concept even though we no longer
 * auto-derive the "current" one from the calendar.
 */
export { BIMESTRE_LABELS, type Bimestre } from '@/lib/bimestre'
