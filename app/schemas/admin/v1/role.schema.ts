import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be string",
  }),
});

export const updateRoleSchema = z.object({
  name: z.string({
    invalid_type_error: "Name must be string",
  }),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
