import { ClimaService } from './Clima.Schemas'
import type { Bimestre } from '@/lib/bimestre'

export class ClimaFacade {
  static getClima(alcaldia: string, bimestre: Bimestre, anio: number) {
    return ClimaService.getClima(alcaldia, bimestre, anio)
  }
}
