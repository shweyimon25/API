import { z } from "zod";

/** Max total daily water per member per date (e.g. ml). */
export const MAX_DAILY_WATER = 3000;

export const createWaterTrackerSchema = z.object({
    date: z.string().min(1, { message: "Date is required" }),
    dailyWater: z.coerce
        .number()
        .min(0, { message: "Daily water cannot be negative" })
        .max(MAX_DAILY_WATER, {
            message: `Daily water cannot exceed ${MAX_DAILY_WATER}`,
        })
        .optional(),
});

export const updateWaterTrackerSchema = z.object({
    dailyWater: z.coerce
        .number()
        .min(0, { message: "Daily water cannot be negative" })
        .max(MAX_DAILY_WATER, {
            message: `Daily water cannot exceed ${MAX_DAILY_WATER}`,
        })
        .optional(),
});

export type CreateWaterTrackerInput = z.infer<typeof createWaterTrackerSchema>;
export type UpdateWaterTrackerInput = z.infer<typeof updateWaterTrackerSchema>;
