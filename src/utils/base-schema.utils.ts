// file: src/utils/base-schema.utils.ts
import type { Document } from "mongoose";

import { model, Schema } from "mongoose";

import type { CombinedPaginateModel } from "@/ts/pagination.types";

import { mongooseAggregatePaginate, mongoosePaginate } from "@/config/paginate.config";

export function createPaginatedSchema<T extends Document>(
  schemaDefinition: Record<string, any>,
  options: Record<string, any> = {},
): Schema<T> {
  const schema = new Schema<T>(schemaDefinition, {
    ...options,
  });

  // Add pagination plugins
  schema.plugin(mongoosePaginate);
  schema.plugin(mongooseAggregatePaginate);

  return schema;
}

export type BaseDocument = {
  createdAt: Date;
  updatedAt: Date;
} & Document;

// Fixed: Use mongoose.model() instead of Model.compile()
export function createPaginatedModel<T extends BaseDocument>(
  name: string,
  schema: Schema<T>,
): CombinedPaginateModel<T> {
  return model<T>(name, schema) as CombinedPaginateModel<T>;
}
