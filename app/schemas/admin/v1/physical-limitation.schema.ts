import z from "zod";
import { Status } from "@prisma/client";

export const createPhysicalLimitationSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  photo: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export const updatePhysicalLimitationSchema = z.object({
  name: z.string().optional(),
  photo: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreatePhysicalLimitationInput = z.infer<typeof createPhysicalLimitationSchema>;
export type UpdatePhysicalLimitationInput = z.infer<typeof updatePhysicalLimitationSchema>;

