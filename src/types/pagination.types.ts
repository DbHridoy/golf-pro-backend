// file: src/types/pagination.types.ts
import type { Request } from "express";
import type { AggregatePaginateModel, Document, PaginateModel } from "mongoose";

export type CustomLabels = {
  totalDocs?: string;
  docs?: string;
  limit?: string;
  page?: string;
  nextPage?: string;
  prevPage?: string;
  totalPages?: string;
  pagingCounter?: string;
  hasPrevPage?: string;
  hasNextPage?: string;
  meta?: string;
};

export type AggregatePaginateOptions = {
  page?: number;
  limit?: number;
  offset?: number;
  sort?: Record<string, number | "asc" | "desc">;
  customLabels?: CustomLabels;
  pagination?: boolean;
  allowDiskUse?: boolean;
  useFacet?: boolean;
  countQuery?: Record<string, any>;
};

export type PaginateResult<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  page?: number;
  totalPages: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  meta?: any;
  [customLabel: string]: T[] | number | boolean | null | undefined;
};

export type AggregatePaginateResult<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  page?: number;
  totalPages: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export type PaginationQuery = {
  page?: string | number;
  limit?: string | number;
  sort?: string;
  select?: string;
  populate?: string;
  search?: string;
  [key: string]: any;
};

export type PaginatedRequest = {
  query: PaginationQuery;
} & Request;

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  error?: string;
};

export type CombinedPaginateModel<T extends Document> = PaginateModel<T> & AggregatePaginateModel<T>;
