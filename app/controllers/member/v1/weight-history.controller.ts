import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../../../../prisma/client"; 

class WeightHistoryController {
    
    private extractFilters(filters: unknown) {
        const filtersStr = typeof filters === "string" ? filters : JSON.stringify(filters ?? "[]");
        
        // Regex to parse Odoo-like tuple filters: [('field', 'op', 'value')]
        const tupleRe = /\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(?:'([^']*)'|([^)]+))\s*\)/g;

        let partnerId: number | null = null;
        let startDate: string | null = null;
        let endDate: string | null = null;

        let match: RegExpExecArray | null;
        while ((match = tupleRe.exec(filtersStr)) !== null) {
            const field = match[1];
            const op = match[2];
            const value = (match[3] ?? match[4] ?? "").trim().replace(/^'|'$/g, "");

            if (field === "partner_id" && op === "=") {
                const id = Number(value);
                if (Number.isInteger(id) && id > 0) partnerId = id;
            }
            if (field === "date" && op === ">=") {
                startDate = value;
            }
            if (field === "date" && op === "<=") {
                endDate = value;
            }
        }

        return { partnerId, startDate, endDate };
    }

    private responseFormat(history: any) {
        return {
            id: history.id,
            partner_id: history.memberId,
            date: history.date ? history.date.toISOString().split('T')[0] : "", // YYYY-MM-DD format
            weight: Number(history.weight) || 0.0,
            height_feet: Number(history.heightFeet) || 0.0,
            height_inch: Number(history.heightInch) || 0.0,
            neck: Number(history.neck) || 0.0,
            calf: Number(history.calf) || 0.0,
            wrist_left: Number(history.wristLeft) || 0.0,
            wrist_right: Number(history.wristRight) || 0.0,
            waist: Number(history.waist) || 0.0,
            hip: Number(history.hip) || 0.0,
            shoulders: Number(history.shoulders) || 0.0,
            arm_left: Number(history.armLeft) || 0.0,
            arm_right: Number(history.armRight) || 0.0,
            thigh_left: Number(history.thighLeft) || 0.0,
            thigh_right: Number(history.thighRight) || 0.0,
            bmi: Number(history.bmi) || 0.0,
            bfp: Number(history.bfp) || 0.0
        };
    }

    async getWeightHistories(req: Request, res: Response) {
        try {
            // Get params from GET query or POST body
            const params = req.method === "GET" && Object.keys(req.query).length
                ? req.query
                : req.body?.params ?? {};

            const { partnerId, startDate, endDate } = this.extractFilters(params.filters);
            
            const offset = Math.max(0, Number(params.offset) || 0);
            const limit = Math.min(100, Math.max(1, Number(params.limit) || 100));

            const where: Prisma.WeightHistoryWhereInput = {};

            if (partnerId) {
                where.memberId = partnerId;
            }

            if (startDate || endDate) {
                where.date = {};
                if (startDate) {
                    where.date.gte = new Date(startDate);
                }
                if (endDate) {
                    where.date.lte = new Date(endDate);
                }
            }

            const [count, members] = await Promise.all([
                prisma.weightHistory.count({ where }),
                prisma.weightHistory.findMany({
                    where,
                    orderBy: { date: "desc" },
                    skip: offset,
                    take: limit,
                }),
            ]);

            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: true,
                    data: {
                        count,
                        results: members.map((history) => this.responseFormat(history)),
                    },
                },
            });

        } catch (error) {
            console.error("Error fetching partner members:", error);
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

export default WeightHistoryController;