import z from "zod";
import { Status } from "@prisma/client";

export const createConsSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  status: z.nativeEnum(Status).optional(),
});

export const updateConsSchema = z.object({
  name: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateConsInput = z.infer<typeof createConsSchema>;
export type UpdateConsInput = z.infer<typeof updateConsSchema>;
