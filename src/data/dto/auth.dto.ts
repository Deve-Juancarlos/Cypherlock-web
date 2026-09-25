import { z } from 'zod'

export const TokenPairDto = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string().default('bearer'),
  expires_in: z.number().default(3600),
})
export type TokenPairDto = z.infer<typeof TokenPairDto>

export const UsuarioDto = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  celular: z.string().nullable().optional(),
  rol: z.string(),
  activo: z.boolean(),
  casa_id: z.number().nullable().optional(),
  creado_en: z.string(),
})
export type UsuarioDto = z.infer<typeof UsuarioDto>
