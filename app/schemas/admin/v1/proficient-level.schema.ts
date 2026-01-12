import z from "zod";
import { Status } from "@prisma/client";

export const createProficientLevelSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updateProficientLevelSchema = z.object({
    name: z.string().optional(),
    status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreateProficientLevelInput = z.infer<typeof createProficientLevelSchema>;
export type UpdateProficientLevelInput = z.infer<typeof updateProficientLevelSchema>;
