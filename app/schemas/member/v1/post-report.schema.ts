import { z } from "zod";

export const createPostReportSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  social_post_id: z.coerce.number().optional(),
  shop_post_id : z.coerce.number().optional(),
  categ_id: z.array(
    z.coerce.number().min(1, { message: "Report Category is required" })
  ),
});

export type CreatePostReportInput = z.infer<typeof createPostReportSchema>;