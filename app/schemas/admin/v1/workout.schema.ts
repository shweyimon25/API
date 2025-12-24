import { Day, Gender, Status } from "@prisma/client";
import { z } from "zod";

export const createWorkoutSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    gender: z.nativeEnum(Gender, { message: "Gender must be MALE | FEMALE | BOTH" }),
    categoryId: z.coerce.number().min(1, { message: "Category is required" }),
    bodyGoalId: z.coerce.number().min(1, { message: "Body goal is required" }),
    proficientLevelId: z.coerce.number().min(1, { message: "Proficient level is required" }),
    placeId: z.coerce.number().min(1, { message: "Place is required" }),
    memberPlanId: z.coerce.number().min(1, { message: "Member plan is required" }),
    workoutDay: z.nativeEnum(Day),
    sets: z.coerce.number().min(1, { message: "Sets is required" }),
    reps: z.coerce.number().min(1, { message: "Reps is required" }),
    status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional()
});

export const updateWorkoutSchema = z.object({
    name: z.string().optional(),
    gender: z.nativeEnum(Gender, {
        message: "Gender must be MALE | FEMALE | BOTH"
    }).optional(),
    categoryId: z.coerce.number().optional(),
    bodyGoalId: z.coerce.number().optional(),
    proficientLevelId: z.coerce.number().optional(),
    placeId: z.coerce.number().optional(),
    memberPlanId: z.coerce.number().optional(),
    workoutDay: z.nativeEnum(Day).optional(),
    sets: z.coerce.number().optional(),
    reps: z.coerce.number().optional(),
    status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional()
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
