import z from "zod";
import { Status } from "@prisma/client";

export const createProsSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updateProsSchema = z.object({
  name: z.string().optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreateProsInput = z.infer<typeof createProsSchema>;
export type UpdateProsInput = z.infer<typeof updateProsSchema>;
