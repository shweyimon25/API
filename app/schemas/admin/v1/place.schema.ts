import z from "zod";
import { Status } from "@prisma/client";

export const createPlaceSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updatePlaceSchema = z.object({
  name: z.string().optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;
