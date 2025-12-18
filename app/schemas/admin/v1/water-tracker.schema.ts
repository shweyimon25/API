import z from "zod";

export const createWaterTrackerSchema = z.object({
  date: z.string({
    required_error: "Date is required",
    invalid_type_error: "Date must be a string",
  }),
  memberId: z.number({
    required_error: "Member ID is required",
    invalid_type_error: "Member ID must be a number",
  }),
  dailyWater: z.number().min(0).optional(),
});

export const updateWaterTrackerSchema = z.object({
  date: z.string().optional(),
  memberId: z.number().optional(),
  dailyWater: z.number().min(0).optional(),
});

export type CreateWaterTrackerInput = z.infer<typeof createWaterTrackerSchema>;
export type UpdateWaterTrackerInput = z.infer<typeof updateWaterTrackerSchema>;

