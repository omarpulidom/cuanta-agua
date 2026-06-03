import { TiempoService } from './Tiempo.Schemas'

export class TiempoFacade {
  static getCurrent = () => TiempoService.getCurrent()
  static getBimestresDelAnio = TiempoService.getBimestresDelAnio
  static getAnios = TiempoService.getAnios
  static formatBimestre = TiempoService.formatBimestre
}
