import z from "zod";
import { Status } from "@prisma/client";

export const createBodyAttentionAreaSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export const updateBodyAttentionAreaSchema = z.object({
  name: z.string().optional(),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export type CreateBodyAttentionAreaInput = z.infer<
  typeof createBodyAttentionAreaSchema
>;
export type UpdateBodyAttentionAreaInput = z.infer<
  typeof updateBodyAttentionAreaSchema
>;
