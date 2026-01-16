import { z } from "zod";

export const createShopSchema = z.object({
    name: z.string({
        message: "Name is required"
    })
});

export const updateShopSchema = z.object({
    name: z.string().optional()
});

export const upgradeShopLevel = z.object({
    shopLevelId: z.coerce.number({
        message: "Shop level is required"
    })
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type UpgradeShopLevelInput = z.infer<typeof upgradeShopLevel>;