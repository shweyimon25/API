import { Day, Gender, Status } from "@prisma/client";
import { z } from "zod";

export const createWorkoutSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.BOTH], { message: "Gender must be MALE or FEMALE or BOTH" }),
    categoryId: z.coerce.number().min(1, { message: "Category is required" }),
    bodyGoalId: z.coerce.number().min(1, { message: "Body goal is required" }),
    proficientLevelId: z.coerce.number().min(1, { message: "Proficient level is required" }),
    placeId: z.coerce.number().min(1, { message: "Place is required" }),
    memberPlanId: z.coerce.number().min(1, { message: "Member plan is required" }),
    workoutDay: z.enum([Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY, Day.SATURDAY, Day.SUNDAY], { message: "Workout day must be MONDAY or TUESDAY or WEDNESDAY or THURSDAY or FRIDAY or SATURDAY or SUNDAY" }),
    sets: z.coerce.number().min(1, { message: "Sets is required" }),
    reps: z.coerce.number().min(1, { message: "Reps is required" }),
    status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional()
});

export const updateWorkoutSchema = z.object({
    name: z.string().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.BOTH], {
        message: "Gender must be MALE or FEMALE or BOTH"
    }).optional(),
    categoryId: z.coerce.number().optional(),
    bodyGoalId: z.coerce.number().optional(),
    proficientLevelId: z.coerce.number().optional(),
    placeId: z.coerce.number().optional(),
    memberPlanId: z.coerce.number().optional(),
    workoutDay: z.enum([Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY, Day.SATURDAY, Day.SUNDAY], { message: "Workout day must be MONDAY or TUESDAY or WEDNESDAY or THURSDAY or FRIDAY or SATURDAY or SUNDAY" }).optional(),
    sets: z.coerce.number().optional(),
    reps: z.coerce.number().optional(),
    status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional()
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
