import z from "zod";
import { Status } from "@prisma/client";

export const createBodyGoalSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updateBodyGoalSchema = z.object({
    name: z.string().optional(),
    status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreateBodyGoalInput = z.infer<typeof createBodyGoalSchema>;
export type UpdateBodyGoalInput = z.infer<typeof updateBodyGoalSchema>;
