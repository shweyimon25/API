import z from "zod";
import { Status } from "@prisma/client";

export const createBodyAttentionAreaSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  status: z.nativeEnum(Status).optional(),
});

export const updateBodyAttentionAreaSchema = z.object({
  name: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateBodyAttentionAreaInput = z.infer<typeof createBodyAttentionAreaSchema>;
export type UpdateBodyAttentionAreaInput = z.infer<typeof updateBodyAttentionAreaSchema>;

