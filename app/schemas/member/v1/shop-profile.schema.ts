import { z } from "zod";

export const createShopProfileSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
});

export const updateShopProfileSchema = z.object({
    name: z.string().optional()
});

export const upgradeShopProfileSchema = z.object({
    shopLevelId: z.coerce.number().min(1, { message: "Shop level is required" }),
});

export type CreateShopProfileInput = z.infer<typeof createShopProfileSchema>;
export type UpdateShopProfileInput = z.infer<typeof updateShopProfileSchema>;
export type UpgradeShopProfileInput = z.infer<typeof upgradeShopProfileSchema>;
