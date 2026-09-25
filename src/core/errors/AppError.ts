/**
 * Error unico de la app. Traduce el formato del backend:
 *   { detail, error: { code, message, request_id, details } }
 * y los fallos de red a un tipo estable que la UI sabe mostrar.
 */
export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'FORBIDDEN_ROLE'
  | 'FORBIDDEN_TENANT'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SERVICE_UNAVAILABLE'
  | 'INVALID_RESPONSE'
  | 'INTERNAL_ERROR'
  | (string & {})

export interface FieldError {
  campo: string
  error: string
}

export class AppError extends Error {
  readonly status: number
  readonly code: ErrorCode
  readonly requestId?: string
  readonly fields: FieldError[]

  constructor(opts: {
    status: number
    code: ErrorCode
    message: string
    requestId?: string
    fields?: FieldError[]
  }) {
    super(opts.message)
    this.name = 'AppError'
    this.status = opts.status
    this.code = opts.code
    this.requestId = opts.requestId
    this.fields = opts.fields ?? []
  }

  get isAuth(): boolean {
    return this.status === 401
  }

  /** Mensaje para la persona usuaria: el del backend o uno claro por codigo. */
  get userMessage(): string {
    if (this.code === 'NETWORK_ERROR') return 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.'
    if (this.code === 'RATE_LIMITED') return 'Demasiados intentos. Espera un momento antes de volver a intentar.'
    if (this.status >= 500) return 'El servidor tuvo un problema. Si se repite, comparte el código de referencia.'
    return this.message || 'No se pudo completar la acción.'
  }
}

interface BackendErrorBody {
  detail?: unknown
  error?: {
    code?: string
    message?: string
    request_id?: string
    details?: { campos?: FieldError[] }
  }
}

export function fromResponse(status: number, body: unknown): AppError {
  const b = (body ?? {}) as BackendErrorBody
  const e = b.error
  const detail = typeof b.detail === 'string' ? b.detail : undefined
  return new AppError({
    status,
    code: e?.code ?? statusToCode(status),
    message: e?.message ?? detail ?? `Error ${status}`,
    requestId: e?.request_id,
    fields: e?.details?.campos,
  })
}

function statusToCode(status: number): ErrorCode {
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 409) return 'CONFLICT'
  if (status === 422) return 'VALIDATION_ERROR'
  if (status === 429) return 'RATE_LIMITED'
  if (status === 503) return 'SERVICE_UNAVAILABLE'
  return 'INTERNAL_ERROR'
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  return new AppError({ status: 0, code: 'NETWORK_ERROR', message: String((err as Error)?.message ?? err) })
}
