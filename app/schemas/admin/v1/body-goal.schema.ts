import z from "zod";
import { Status } from "@prisma/client";

export const createBodyGoalSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export const updateBodyGoalSchema = z.object({
    name: z.string().optional(),
    status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export type CreateBodyGoalInput = z.infer<typeof createBodyGoalSchema>;
export type UpdateBodyGoalInput = z.infer<typeof updateBodyGoalSchema>;
