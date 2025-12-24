import { z } from "zod";
import { Status } from "@prisma/client";

export const createRoleSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  permissions: z.array(
    z.coerce.number().min(1, { message: "Permissions is required" })
  ),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .optional(),
  permissions: z.array(z.coerce.number()).optional(),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
