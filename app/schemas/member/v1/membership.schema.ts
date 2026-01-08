import { Gender } from "@prisma/client";
import { z } from "zod";

export const trainerMemberRequestSchema = z.object({
    memberPlanId: z.coerce.number().min(1, { message: "Member plan is required" }),
    age: z.coerce.number().min(1, { message: "Age is required" }),
    email: z.string().email({ message: "Invalid email address" }).optional(),
    phone: z
        .string()
        .min(9, { message: "Phone must be at least 9 digits long" })
        .max(15, { message: "Phone must be at most 15 digits long" })
        .optional(),
    yearOfExp: z.coerce.number().min(1, { message: "Year of experience is required" }),
    reason: z.string().min(1, { message: "Reason is required" }),
    gender: z.nativeEnum(Gender, { message: "Gender must be MALE | FEMALE | BOTH" }),
    heightFeet: z.string().min(1, { message: "Height in feet is required" }),
    heightInches: z.string().min(1, { message: "Height in inches is required" }),
    weight: z.string().min(1, { message: "Weight is required" }),
    neck: z.string().min(1, { message: "Neck is required" }),
    waist: z.string().min(1, { message: "Waist is required" }),
    shoulders: z.string().min(1, { message: "Shoulders is required" }),
    thigh: z.string().min(1, { message: "Thigh is required" }),
    calf: z.string().min(1, { message: "Calf is required" }),
    arms: z.string().min(1, { message: "Arms is required" }),
    wrist: z.string().min(1, { message: "Wrist is required" }),
    chest: z.string().min(1, { message: "Chest is required" }),
    hip: z.string().min(1, { message: "Hip is required" }),
});

export type TrainerMemberRequestInput = z.infer<typeof trainerMemberRequestSchema>;