import z from "zod";
import { Status } from "@prisma/client";

export const createConsSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export const updateConsSchema = z.object({
  name: z.string().optional(),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export type CreateConsInput = z.infer<typeof createConsSchema>;
export type UpdateConsInput = z.infer<typeof updateConsSchema>;
