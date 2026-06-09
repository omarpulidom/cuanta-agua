import { z } from 'zod'
import { Constants } from '@/lib/Constants'
import { req } from '../req'
import { CorrelacionRowSchema, type CorrelacionRow } from './Clima.Schemas'

export class ClimaService {
  static async getCorrelacion(anio?: number): Promise<CorrelacionRow[]> {
    const data = await req
      .get(`${Constants.ENDPOINTS.CORRELACION}${anio ? `?anio=${anio}` : ''}`)
      .json()
    return z.array(CorrelacionRowSchema).parse(data)
  }
}
