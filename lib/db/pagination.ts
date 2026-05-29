export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

export type PaginationInput = {
  page?: string | number | null;
  pageSize?: string | number | null;
};

export function getPagination(input: PaginationInput = {}) {
  const parsedPage = Number(input.page ?? DEFAULT_PAGE);
  const parsedPageSize = Number(input.pageSize ?? DEFAULT_PAGE_SIZE);

  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : DEFAULT_PAGE;
  const pageSize = Number.isFinite(parsedPageSize) && parsedPageSize > 0
    ? Math.min(Math.floor(parsedPageSize), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function getPaginationMeta(total: number, page: number, pageSize: number) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    hasNextPage: page * pageSize < total,
    hasPreviousPage: page > 1,
  };
}
