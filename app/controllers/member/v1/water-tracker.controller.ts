import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { Member } from "@prisma/client";


class WaterTrackerController {
    
    // Odoo Domain Filters 
    private filterValue(filters: unknown, fieldName: string, operator: string = "=") {
        const filtersStr =
            typeof filters === "string" ? filters : JSON.stringify(filters ?? "[]");
        
        const tupleRe =
            /\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(?:'([^']*)'|([^)]+))\s*\)/g;

        let match: RegExpExecArray | null;
        while ((match = tupleRe.exec(filtersStr)) !== null) {
            const field = match[1];
            const op = match[2];
            const value = (match[3] ?? match[4] ?? "").trim().replace(/^'|'$/g, "");
            
            if (field === fieldName && op === operator) {
                return value;
            }
        }
        return null;
    }

    // Response Format 
    private formatWaterTracker(track: {
        id: number;
        date: string;
        memberId: number;
        dailyWater: number;
    }) {
        return {
            id: track.id,
            date: track.date,
            partner_id: track.memberId,    
            daily_water: track.dailyWater   
        };
    }

    async getWaterTrackers(req: Request, res: Response) {
        const params =
            req.method === "GET" && Object.keys(req.query).length
                ? req.query
                : req.body?.params ?? {};

        // 1. Get Filters
        const partnerIdStr = this.filterValue(params.filters, "partner_id", "=");
        const exactDate = this.filterValue(params.filters, "date", "=");
        const startDate = this.filterValue(params.filters, "date", ">=");
        const endDate = this.filterValue(params.filters, "date", "<=");

        const partnerId = partnerIdStr ? Number(partnerIdStr) : null;

        // 2. Create Prisma WhereInput
        const where: Prisma.WaterTrackerWhereInput = {};

        if (partnerId && Number.isInteger(partnerId) && partnerId > 0) {
            where.memberId = partnerId;
        }

        
        if (exactDate) {
            where.date = exactDate; 
        } else if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = startDate;
            if (endDate) where.date.lte = endDate;
        }
        try {
            // 3. Get Count and DataList
            const [count, trackers] = await Promise.all([
                prisma.waterTracker.count({ where }),
                prisma.waterTracker.findMany({
                    where,
                    orderBy: { date: "desc" },
                    
                }),
            ]);

            // 4. Return according to Output Response format
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: true,
                    data: {
                        count,
                        results: trackers.map((track) => this.formatWaterTracker(track)),
                    },
                },
            });
        } catch (error) {
            console.error("Fetch water trackers error:", error);
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: "Internal server error",
                    data: null,
                },
            });
        }
    }

    async createWaterTracker(req: Request, res: Response) {

        const memberId = (req.user as Member).id;

        if (!memberId) {
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: "Unauthorized access",
                    data: null,
                },
            });
        }

        const params = req.body?.params ?? {};
        const dailyWater = Number(params.daily_water);

        if (isNaN(dailyWater) || dailyWater < 0) {
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: "Invalid daily_water value",
                    data: null,
                },
            });
        }

        const today = new Date();
        today.setHours(today.getHours() + 6);
        today.setMinutes(today.getMinutes() + 30);
        const formattedDate = today.toISOString().split('T')[0]; // Output: "2026-06-09" 

        try {
            const newTracker = await prisma.waterTracker.create({
                data: {
                    memberId: memberId,
                    date: formattedDate,
                    dailyWater: dailyWater,
                },
            });

            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: true,
                    data: {
                        id: newTracker.id,
                        date: newTracker.date,
                        partner_id: newTracker.memberId,
                        daily_water: newTracker.dailyWater,
                    },
                },
            });

        } catch (error) {
            console.error("Create water tracker error:", error);
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: "Internal server error",
                    data: null,
                },
            });
        }
    }
}

export default WaterTrackerController;
