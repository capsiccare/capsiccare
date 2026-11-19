import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  error: null
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
    [key: string]: any
  }
  requestId: string
  timestamp: string
}

export interface ApiErrorDetail {
  field?: string
  message: string
  code?: string
}

export interface ApiErrorResponse {
  success: false
  data: null
  error: {
    code: string
    message: string
    details?: ApiErrorDetail[]
  }
  requestId: string
  timestamp: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export class ApiError extends Error {
  code: string
  status: number
  details?: ApiErrorDetail[]

  constructor(code: string, message: string, status: number = 400, details?: ApiErrorDetail[]) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

/**
 * Generates an RFC4122 v4 UUID or fallback request identifier.
 */
export function getOrCreateRequestId(req?: Request): string {
  if (req) {
    const headerId = req.headers.get('x-request-id')
    if (headerId) return headerId
  }
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Creates a standardized 2xx success response.
 */
export function successResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta'],
  status: number = 200,
  requestId?: string
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    error: null,
    ...(meta ? { meta } : {}),
    requestId: requestId || getOrCreateRequestId(),
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(body, {
    status,
    headers: {
      'x-request-id': body.requestId,
    },
  })
}

/**
 * Creates a standardized error response.
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: ApiErrorDetail[],
  requestId?: string
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = {
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {}),
    },
    requestId: requestId || getOrCreateRequestId(),
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(body, {
    status,
    headers: {
      'x-request-id': body.requestId,
    },
  })
}

/**
 * Global API error boundary handler. Safely maps Zod errors, ApiErrors,
 * and unknown exceptions to standard API envelopes without leaking internals.
 */
export function handleApiError(error: unknown, req?: Request): NextResponse<ApiErrorResponse> {
  const requestId = getOrCreateRequestId(req)

  if (error instanceof ApiError) {
    return errorResponse(error.code, error.message, error.status, error.details, requestId)
  }

  if (error instanceof ZodError) {
    const details: ApiErrorDetail[] = error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }))
    return errorResponse('VALIDATION_ERROR', 'Request validation failed', 400, details, requestId)
  }

  const message = error instanceof Error ? error.message : 'An unexpected internal error occurred'

  if (message.startsWith('UNAUTHORIZED')) {
    return errorResponse('UNAUTHORIZED', message.replace('UNAUTHORIZED: ', ''), 401, undefined, requestId)
  }

  if (message.startsWith('FORBIDDEN')) {
    return errorResponse('FORBIDDEN', message.replace('FORBIDDEN: ', ''), 403, undefined, requestId)
  }

  // Hide system stack traces in production
  console.error(`[API ERROR ${requestId}]`, error)
  return errorResponse('INTERNAL_SERVER_ERROR', 'An unexpected error occurred. Please contact support.', 500, undefined, requestId)
}
