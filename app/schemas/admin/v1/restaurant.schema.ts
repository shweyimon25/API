import z from "zod";
import prisma from "../../../../prisma/client";

export const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .refine(
      async (arg) => {
        const result = await prisma.type.findFirst({
          where: { name: arg },
        });
        return !result;
      },
      {
        message: "Name is already exist",
      }
    ),
  typeId: z.number().refine(async (arg) => {
    const result = await prisma.type.findUnique({
      where: {
        id: arg,
      },
    });
    return result;
  }, {
    message: "Type is not exist",
  }),
  logoUrl: z.string().optional().refine((arg) => {
    if (!arg) return true;
    return arg.startsWith("http://") || arg.startsWith("https://");
  }, {
    message: "Logo URL is not valid",
  }),
  bannerUrl: z.string().optional().refine((arg) => {
    if (!arg) return true;
    return arg.startsWith("http://") || arg.startsWith("https://");
  }, {
    message: "Banner URL is not valid",
  }),
  phone: z.string().min(8, { message: "Invalid phone number" }).max(15, { message: "Invalid phone number" }).refine((arg) => /^\d+$/.test(arg), {
    message: "Phone must be a number",
  }),
  address: z.string(),
  lineId: z.string(),
  facebookUrl: z.string().optional(),
  coordinateLatitude: z.string(),
  coordinateLongitude: z.string(),
  preBookingPeriod: z.number().optional(),
  openDays: z.array(z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])).optional(),
  openTime: z.string().optional(),
  status: z.boolean().optional(),
});

export const updateRestaurantSchema = z.object({
  name: z.string().optional(),
  typeId: z.number().refine(async (arg) => {
    const result = await prisma.type.findUnique({
      where: {
        id: arg,
      },
    });
    return result;
  }, {
    message: "Type is not exist",
  }).optional(),
  logoUrl: z.string().optional().refine((arg) => {
    if (!arg) return true;
    return arg.startsWith("http://") || arg.startsWith("https://");
  }, {
    message: "Logo URL is not valid",
  }),
  bannerUrl: z.string().optional().refine((arg) => {
    if (!arg) return true;
    return arg.startsWith("http://") || arg.startsWith("https://");
  }, {
    message: "Banner URL is not valid",
  }).optional(),
  phone: z.string().min(8, { message: "Invalid phone number" }).max(15, { message: "Invalid phone number" }).refine((arg) => /^\d+$/.test(arg), {
    message: "Phone must be a number",
  }).optional(),
  address: z.string().optional(),
  lineId: z.string().optional(),
  facebookUrl: z.string().optional(),
  coordinateLatitude: z.string().optional(),
  coordinateLongitude: z.string().optional(),
  preBookingPeriod: z.number().optional(),
  openDays: z.array(z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]).optional()),
  openTime: z.string().optional(),
  status: z.boolean().optional(),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
