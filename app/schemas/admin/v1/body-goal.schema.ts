import z from "zod";

export const createBodyGoalSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }),
});

export const updateBodyGoalSchema = z.object({
    name: z.string().optional(),
});

export type CreateBodyGoalInput = z.infer<typeof createBodyGoalSchema>;
export type UpdateBodyGoalInput = z.infer<typeof updateBodyGoalSchema>;
