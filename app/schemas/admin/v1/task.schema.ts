import z from "zod";
import { TaskStatus } from "@prisma/client";
import { parseDateDMY } from "../../../helpers/helper";

const tacDateSchema = z
  .string()
  .min(1, { message: "TAC is required" })
  .regex(/^\d{2}-\d{2}-\d{4}$/, {
    message: "TAC must be in DD-MM-YYYY format",
  })
  .transform((value, ctx) => {
    const date = parseDateDMY(value);

    if (!date) {
      ctx.addIssue({
        code: "custom",
        message: "TAC must be a valid date in DD-MM-YYYY format",
      });
      return z.NEVER;
    }

    return date;
  });

export const createTaskSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  tac: tacDateSchema,
  completedPercentage: z.coerce.number().min(0).max(100).optional(),
  projectId: z.coerce.number().min(1, { message: "Project is required" }),
  status: z
    .enum(
      [
        TaskStatus.OPEN,
        TaskStatus.ON_TRACK,
        TaskStatus.INDICATION_OF_DELAY,
        TaskStatus.DELAYED,
        TaskStatus.COMPLETED,
      ],
      { message: "Invalid task status" },
    )
    .optional(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  tac: tacDateSchema.optional(),
  completedPercentage: z.coerce.number().min(0).max(100).optional(),
  projectId: z.coerce.number().min(1).optional(),
  status: z
    .enum(
      [
        TaskStatus.OPEN,
        TaskStatus.ON_TRACK,
        TaskStatus.INDICATION_OF_DELAY,
        TaskStatus.DELAYED,
        TaskStatus.COMPLETED,
      ],
      { message: "Invalid task status" },
    )
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
