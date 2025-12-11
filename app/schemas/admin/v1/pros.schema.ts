import z from "zod";
import { Status } from "@prisma/client";

export const createProsSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  status: z.nativeEnum(Status).optional(),
});

export const updateProsSchema = z.object({
  name: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateProsInput = z.infer<typeof createProsSchema>;
export type UpdateProsInput = z.infer<typeof updateProsSchema>;
