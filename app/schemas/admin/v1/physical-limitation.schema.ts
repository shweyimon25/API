import z from "zod";
import { Status } from "@prisma/client";

export const createPhysicalLimitationSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updatePhysicalLimitationSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreatePhysicalLimitationInput = z.infer<typeof createPhysicalLimitationSchema>;
export type UpdatePhysicalLimitationInput = z.infer<typeof updatePhysicalLimitationSchema>;

