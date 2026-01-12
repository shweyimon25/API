import z from "zod";
import { Status } from "@prisma/client";

export const createBodyAttentionAreaSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updateBodyAttentionAreaSchema = z.object({
  name: z.string().optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreateBodyAttentionAreaInput = z.infer<
  typeof createBodyAttentionAreaSchema
>;
export type UpdateBodyAttentionAreaInput = z.infer<
  typeof updateBodyAttentionAreaSchema
>;
