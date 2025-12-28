import type { Request } from "express";
import type { Model } from "mongoose";

export async function dynamicSearch(req: Request, model: Model<any>) {
  try {
    const queryParams = req.query;

    const query: any = {};

    for (const key in queryParams) {
      const rawValue = queryParams[key];

      const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

      if (!value) continue;

      if (!Number.isNaN(Number(value))) {
        query[key] = Number(value);
      } else {
        query[key] = { $regex: value, $options: "i" };
      }
    }

    const results = await model.find(query);

    return {
      success: true,
      results,
    };
  } catch (err) {
    const error = err as Error;
    throw new Error(`Search failed: ${error.message}`);
  }
}
