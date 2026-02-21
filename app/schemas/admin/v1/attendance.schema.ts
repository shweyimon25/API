import { z } from "zod";

export const createAttendanceSchema = z.object({
    memberId: z.number(),
    date: z
        .string()
        .regex(
            /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/,
            "Invalid date fromat (eg; DD-MM-YYYY)"
        ),
});

export const updateAttendanceSchema = z.object({
    memberId: z.number().optional(),
    date: z
        .string()
        .regex(
            /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/,
            "Invalid date fromat (eg; DD-MM-YYYY)"
        )
        .optional(),
});

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;