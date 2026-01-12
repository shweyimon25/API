import z from "zod";
import { Status } from "@prisma/client";

export const createTagSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updateTagSchema = z.object({
  name: z.string().optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;

