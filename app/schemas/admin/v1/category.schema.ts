import z from "zod";
import { Status } from "@prisma/client";

export const createCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export const updateCategroySchema = z.object({
  name: z.string().optional(),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategroySchema>;
