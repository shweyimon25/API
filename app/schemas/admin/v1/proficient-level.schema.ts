import z from "zod";

export const createProficientLevelSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }),
});

export const updateProficientLevelSchema = z.object({
    name: z.string().optional(),
});

export type CreateProficientLevelInput = z.infer<typeof createProficientLevelSchema>;
export type UpdateProficientLevelInput = z.infer<typeof updateProficientLevelSchema>;
