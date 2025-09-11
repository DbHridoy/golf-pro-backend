// file: src/utils/pagination-helper.ts
import type { PaginateOptions } from "mongoose";

import type {
  AggregatePaginateOptions,
  AggregatePaginateResult,
  PaginatedResponse,
  PaginateResult,
  PaginationQuery,
} from "../types/pagination.types";

export class PaginationHelper {
  static parsePaginationParams(query: PaginationQuery): PaginateOptions {
    const page = Math.max(1, Number.parseInt(String(query.page)) || 1);
    const limit = Math.min(Math.max(1, Number.parseInt(String(query.limit)) || 10), 100);
    const sort = query.sort ? this.parseSortString(String(query.sort)) : { createdAt: -1 };
    const select = query.select ? String(query.select) : "";
    const populate = query.populate ? String(query.populate) : ""; // Keep as string

    return {
      page,
      limit,
      sort,
      select,
      populate,
    };
  }

  static parseSortString(sortString: string): Record<string, number | "asc" | "desc"> {
    if (!sortString)
      return { createdAt: -1 };

    const sortObj: Record<string, number | "asc" | "desc"> = {};
    const fields = sortString.split(",");

    fields.forEach((field) => {
      field = field.trim();
      if (field.startsWith("-")) {
        sortObj[field.substring(1)] = -1;
      }
      else {
        sortObj[field] = 1;
      }
    });

    return sortObj;
  }

  static parsePopulateString(populateString: string): Array<Record<string, any>> {
    if (!populateString)
      return [];

    return populateString.split(",").map(field => ({
      path: field.trim(),
    }));
  }

  // Fixed: Handle undefined values with nullish coalescing
  static formatResponse<T>(paginateResult: PaginateResult<T> | AggregatePaginateResult<T>): PaginatedResponse<T> {
    return {
      success: true,
      data: paginateResult.docs,
      pagination: {
        currentPage: paginateResult.page || 1,
        totalPages: paginateResult.totalPages,
        totalItems: paginateResult.totalDocs,
        itemsPerPage: paginateResult.limit,
        hasNext: paginateResult.hasNextPage,
        hasPrev: paginateResult.hasPrevPage,
        nextPage: paginateResult.nextPage ?? null, // Fixed: Use nullish coalescing
        prevPage: paginateResult.prevPage ?? null, // Fixed: Use nullish coalescing
      },
    };
  }

  static getAggregateOptions(query: PaginationQuery): AggregatePaginateOptions {
    const page = Math.max(1, Number.parseInt(String(query.page)) || 1);
    const limit = Math.min(Math.max(1, Number.parseInt(String(query.limit)) || 10), 100);
    const sort = query.sort ? this.parseSortString(String(query.sort)) : { createdAt: -1 };

    return {
      page,
      limit,
      sort,
      allowDiskUse: true,
      useFacet: true,
    };
  }

  static createSearchFilter(query: PaginationQuery, searchFields: string[] = []): Record<string, any> {
    const filter: Record<string, any> = {};

    if (query.search && searchFields.length > 0) {
      filter.$or = searchFields.map(field => ({
        [field]: { $regex: query.search, $options: "i" },
      }));
    }

    Object.keys(query).forEach((key) => {
      if (!["page", "limit", "sort", "select", "populate", "search"].includes(key)) {
        filter[key] = query[key];
      }
    });

    return filter;
  }
}
