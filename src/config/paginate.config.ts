import type { PaginateOptions } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoosePaginate from "mongoose-paginate-v2";

import type { CustomLabels } from "@/ts/pagination.types";

// Custom labels configuration
const customLabels: CustomLabels = {
  totalDocs: "totalItems",
  docs: "data",
  limit: "itemsPerPage",
  page: "currentPage",
  nextPage: "next",
  prevPage: "prev",
  totalPages: "pageCount",
  pagingCounter: "slNo",
  meta: "pagination",
};

// Default options for mongoose-paginate-v2 (use mongoose's PaginateOptions)
export const defaultPaginateOptions: PaginateOptions = {
  page: 1,
  limit: 10,
  lean: true,
  leanWithId: true,
  sort: { createdAt: -1 },
  select: "",
  populate: "", // This should be string or PopulateOptions
  customLabels,
  pagination: true,
  useEstimatedCount: false,
  allowDiskUse: true,
};

mongoosePaginate.paginate.options = defaultPaginateOptions;
export { mongooseAggregatePaginate, mongoosePaginate };
