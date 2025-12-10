import { Day, Gender } from "@prisma/client";
import { z } from "zod";

export const createWorkoutSchema = z.object({
    name: z.string({
        invalid_type_error: "Name must be string",
        required_error: "Name is required"
    }),
    gender: z.nativeEnum(Gender, {
        message: "Gender must be MALE | FEMALE | BOTH"
    }),
    categoryId: z.coerce.number({
        required_error: "Category is required",
        invalid_type_error: "Category must be number"
    }),
    bodyGoalId: z.coerce.number({
        required_error: "Body goal is required",
        invalid_type_error: "Body goal must be number"
    }),
    proficientLevelId: z.coerce.number({
        required_error: "Proficient level is required",
        invalid_type_error: "Proficient level must be number"
    }),
    placeId: z.coerce.number({
        required_error: "Place is required",
        invalid_type_error: "Place must be number"
    }),
    memberPlanId: z.coerce.number({
        required_error: "Member plan is required",
        invalid_type_error: "Member plan must be number"
    }),
    workoutDay: z.nativeEnum(Day),
    sets: z.coerce.number({
        required_error: "Sets is required",
        invalid_type_error: "Sets must be number"
    }),
    reps: z.coerce.number({
        required_error: "Reps is required",
        invalid_type_error: "Reps must be number"
    })
});

export const updateWorkoutSchema = z.object({
    name: z.string({
        invalid_type_error: "Name must be string",
    }).optional(),
    gender: z.nativeEnum(Gender, {
        message: "Gender must be MALE | FEMALE | BOTH"
    }),
    categoryId: z.coerce.number({
        invalid_type_error: "Category must be number"
    }).optional(),
    bodyGoalId: z.coerce.number({
        invalid_type_error: "Body goal must be number"
    }).optional(),
    proficientLevelId: z.coerce.number({
        invalid_type_error: "Proficient level must be number"
    }).optional(),
    placeId: z.coerce.number({
        invalid_type_error: "Place must be number"
    }).optional(),
    memberPlanId: z.coerce.number({
        invalid_type_error: "Member plan must be number"
    }).optional(),
    workoutDay: z.nativeEnum(Day),
    sets: z.coerce.number({
        invalid_type_error: "Sets must be number"
    }).optional(),
    reps: z.coerce.number({
        invalid_type_error: "Reps must be number"
    }).optional()
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
