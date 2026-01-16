import { z } from "zod";

export const updateShopProfileSchema = z.object({
    name: z.string().optional()
});

export const upgradeShopProfileSchema = z.object({
    shopLevelId: z.coerce.number().min(1, { message: "Shop level is required" }),
});

export type UpdateShopProfileInput = z.infer<typeof updateShopProfileSchema>;
export type UpgradeShopProfileInput = z.infer<typeof upgradeShopProfileSchema>;