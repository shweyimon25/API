import { z } from "zod";
import { Status } from "@prisma/client";

export const createRoleSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be string",
  }),
  status: z.nativeEnum(Status).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string({
    invalid_type_error: "Name must be string",
  }).optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
