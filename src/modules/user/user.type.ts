import type { z } from "zod";

import type { changePasswordSchema, getUserByIdSchema, getUsersSchema, updateUserSchema } from "./user.schema";

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type GetUsersInput = z.infer<typeof getUsersSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
