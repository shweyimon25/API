import z from "zod";
import { Status } from "@prisma/client";

export const createCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updateCategroySchema = z.object({
  name: z.string().optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategroySchema>;
