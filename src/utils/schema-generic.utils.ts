import { isValidObjectId } from "mongoose";
import { z } from "zod";

export const objectIdGeneric = z
  .string()
  .refine(
    val => isValidObjectId(val),
    {
      message: "Invalid ObjectId format",
    },
  );

export const dateGeneric = z.union([
  z.string().pipe(z.coerce.date()),
  z.date(),
]).refine(
  date => date instanceof Date && !Number.isNaN(date.getTime()),
  {
    message: "Invalid date format",
  },
);

// Additional utility schemas
export const positiveNumberGeneric = z.number().positive("Must be a positive number");
export const nonEmptyStringGeneric = z.string().trim().min(1, "Cannot be empty");
export const emailGeneric = z.string().email("Invalid email format").toLowerCase();

// Pagination query helpers
export const paginationQueryGeneric = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.string().optional(),
  search: z.string().trim().optional(),
});
