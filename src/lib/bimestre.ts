export type Bimestre = 1 | 2 | 3 | 4 | 5 | 6

export const BIMESTRE_LABELS: Record<Bimestre, string> = {
  1: 'Ene - Feb',
  2: 'Mar - Abr',
  3: 'May - Jun',
  4: 'Jul - Ago',
  5: 'Sep - Oct',
  6: 'Nov - Dic',
}

export const BIMESTRE_FULL_LABELS: Record<Bimestre, string> = {
  1: 'Bimestre 1 (Ene-Feb)',
  2: 'Bimestre 2 (Mar-Abr)',
  3: 'Bimestre 3 (May-Jun)',
  4: 'Bimestre 4 (Jul-Ago)',
  5: 'Bimestre 5 (Sep-Oct)',
  6: 'Bimestre 6 (Nov-Dic)',
}

export type TiempoKey = {
  bimestre: Bimestre
  anio: number
}

export function getCurrentBimestre(): TiempoKey {
  const now = new Date()
  const month = now.getMonth() + 1
  const anio = now.getFullYear()
  const bimestre = (Math.ceil(month / 2) as Bimestre)
  return { bimestre, anio }
}

export function formatBimestre(b: Bimestre, a: number): string {
  return `Bimestre ${b} / ${a}`
}

export function formatBimestreShort(b: Bimestre, a: number): string {
  return `B${b} · ${a}`
}

export function getBimestreRange(anio: number): Bimestre[] {
  return [1, 2, 3, 4, 5, 6]
}

export function getAniosDisponibles(): number[] {
  const current = new Date().getFullYear()
  const start = 2020
  const result: number[] = []
  for (let y = start; y <= current; y++) {
    result.push(y)
  }
  return result.reverse()
}

export function getPrevBimestre(b: Bimestre, a: number): TiempoKey {
  if (b === 1) {
    return { bimestre: 6, anio: a - 1 }
  }
  return { bimestre: (b - 1) as Bimestre, anio: a }
}

export function getBimestreId(b: Bimestre, a: number): number {
  return a * 10 + b
}

export function fromBimestreId(id: number): TiempoKey {
  const bimestre = (id % 10) as Bimestre
  const anio = Math.floor(id / 10)
  return { bimestre, anio }
}
