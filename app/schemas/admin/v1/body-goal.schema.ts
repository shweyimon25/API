import z from "zod";
import { Status } from "@prisma/client";

export const createBodyGoalSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }),
    status: z.nativeEnum(Status).optional(),
});

export const updateBodyGoalSchema = z.object({
    name: z.string().optional(),
    status: z.nativeEnum(Status).optional(),
});

export type CreateBodyGoalInput = z.infer<typeof createBodyGoalSchema>;
export type UpdateBodyGoalInput = z.infer<typeof updateBodyGoalSchema>;
