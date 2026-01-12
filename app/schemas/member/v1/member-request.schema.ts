import { Gender } from "@prisma/client";
import { z } from "zod";

export const trainerMemberRequestSchema = z.object({
    memberPlanId: z.coerce.number({
        message: "Member plan is required"
    }),
    age: z.coerce.number({
        message: "Age is required"
    }),
    email: z.string().email({ message: "Invalid email address" }).optional(),
    phone: z
        .string()
        .min(9, { message: "Phone must be at least 9 digits long" })
        .max(15, { message: "Phone must be at most 15 digits long" })
        .optional(),  
    yearOfExp: z.coerce.number({
        message: "Year of experience is required"
    }),
    reason: z.string({
        message: "Reason is required"
    }),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.BOTH], { message: "Gender must be MALE or FEMALE or BOTH" }),
});

export type TrainerMemberRequestInput = z.infer<typeof trainerMemberRequestSchema>;