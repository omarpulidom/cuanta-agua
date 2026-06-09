import { z } from 'zod'
import { Constants } from '@/lib/Constants'
import { req } from '../req'

export class TiempoService {
  static async getAnios(): Promise<number[]> {
    const data = await req.get(Constants.ENDPOINTS.ANIOS).json()
    return z.array(z.number().int()).parse(data)
  }

  static async getBimestres(): Promise<number[]> {
    const data = await req.get(Constants.ENDPOINTS.BIMESTRES).json()
    return z.array(z.number().int()).parse(data)
  }
}
