import z from "zod";
import { Permission } from "@prisma/client";

const permissionEnum = z.enum(
  [Permission.FULL_CONTROL, Permission.PROJECT_MANAGEMENT],
  { message: "Invalid permission" },
);

export const createRoleSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional().nullable(),
  permission: permissionEnum.optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  description: z.string().optional().nullable(),
  permission: permissionEnum.optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
