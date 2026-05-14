import z from "zod";
import { Status } from "@prisma/client";

export const createReportCategorySchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updateReportCategorySchema = z.object({
    name: z.string().optional(),
    status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreateReportCategoryInput = z.infer<typeof createReportCategorySchema>;
export type UpdateReportCategoryInput = z.infer<typeof updateReportCategorySchema>;
