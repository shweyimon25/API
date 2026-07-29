import z from "zod";
import { DeliverableStatus } from "@prisma/client";
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

export const createDeliveriableSchema = z.object({
  deliverable: z.string().min(1, { message: "Deliverable is required" }),
  tac: tacDateSchema,
  completedPercentage: z.coerce.number().min(0).max(100).optional(),
  projectId: z.coerce.number().min(1, { message: "Project is required" }),
  status: z
    .enum(
      [
        DeliverableStatus.OPEN,
        DeliverableStatus.ON_TRACK,
        DeliverableStatus.INDICATION_OF_DELAY,
        DeliverableStatus.DELAYED,
        DeliverableStatus.COMPLETED,
      ],
      { message: "Invalid deliverable status" },
    )
    .optional(),
});

export const updateDeliveriableSchema = z.object({
  deliverable: z
    .string()
    .min(1, { message: "Deliverable is required" })
    .optional(),
  tac: tacDateSchema.optional(),
  completedPercentage: z.coerce.number().min(0).max(100).optional(),
  projectId: z.coerce.number().min(1).optional(),
  status: z
    .enum(
      [
        DeliverableStatus.OPEN,
        DeliverableStatus.ON_TRACK,
        DeliverableStatus.INDICATION_OF_DELAY,
        DeliverableStatus.DELAYED,
        DeliverableStatus.COMPLETED,
      ],
      { message: "Invalid deliverable status" },
    )
    .optional(),
});

export type CreateDeliveriableInput = z.infer<typeof createDeliveriableSchema>;
export type UpdateDeliveriableInput = z.infer<typeof updateDeliveriableSchema>;
