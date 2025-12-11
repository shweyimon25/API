import z from "zod";
import { Status } from "@prisma/client";

export const createProficientLevelSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }),
    status: z.nativeEnum(Status).optional(),
});

export const updateProficientLevelSchema = z.object({
    name: z.string().optional(),
    status: z.nativeEnum(Status).optional(),
});

export type CreateProficientLevelInput = z.infer<typeof createProficientLevelSchema>;
export type UpdateProficientLevelInput = z.infer<typeof updateProficientLevelSchema>;
