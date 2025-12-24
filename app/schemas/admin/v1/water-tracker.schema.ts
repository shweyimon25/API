import z from "zod";

export const createWaterTrackerSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  memberId: z.coerce.number().min(1, { message: "Member is required" }),
  dailyWater: z.coerce.number().min(0).optional(),
});

export const updateWaterTrackerSchema = z.object({
  date: z.string().optional(),
  memberId: z.coerce.number().optional(),
  dailyWater: z.coerce.number().min(0).optional(),
});

export type CreateWaterTrackerInput = z.infer<typeof createWaterTrackerSchema>;
export type UpdateWaterTrackerInput = z.infer<typeof updateWaterTrackerSchema>;

