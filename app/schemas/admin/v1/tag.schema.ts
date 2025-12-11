import z from "zod";
import { Status } from "@prisma/client";

export const createTagSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  status: z.nativeEnum(Status).optional(),
});

export const updateTagSchema = z.object({
  name: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;

