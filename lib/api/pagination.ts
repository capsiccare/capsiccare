export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginatedResult<T> {
  items: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Parses and sanitizes URL search parameters for standard pagination.
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const rawPage = parseInt(searchParams.get('page') || '1', 10)
  const rawLimit = parseInt(searchParams.get('limit') || '20', 10)

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Slices an in-memory array and builds pagination metadata.
 */
export function paginateArray<T>(items: T[], page: number, limit: number): PaginatedResult<T> {
  const total = items.length
  const totalPages = Math.ceil(total / limit) || 1
  const offset = (page - 1) * limit
  const sliced = items.slice(offset, offset + limit)

  return {
    items: sliced,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}
