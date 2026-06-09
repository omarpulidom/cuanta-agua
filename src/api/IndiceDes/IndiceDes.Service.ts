import { Constants } from '@/lib/Constants'
import { req } from '../req'
import { IndiceDesRowSchema, type IndiceDesRow } from './IndiceDes.Schemas'
import { z } from 'zod'

export class IndiceDesService {
  static async list(): Promise<IndiceDesRow[]> {
    const data = await req.get(Constants.ENDPOINTS.INDICES).json()
    return z.array(IndiceDesRowSchema).parse(data)
  }
}
