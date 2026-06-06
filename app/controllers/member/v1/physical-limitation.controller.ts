import { Request, Response } from "express";
import prisma from "../../../../prisma/client";


class PhysicalLimitationController {
    
    // Prepare response format
    private formatResponse(item: {
        id: number;
        name: string;
        photo: string | null;
        
    }) {
        return {
            id: item.id,
            name: item.name ? item.name : '',
            image_url: item.photo ? item.photo : '',
            };
    }

    // Get all physical limitations with pagination
    async getPhysicalLimitations(req: Request, res: Response) {
        const params =
            req.method === "GET" && Object.keys(req.query).length
                ? req.query
                : req.body?.params ?? {};
        const offset = Math.max(0, Number(params.offset) || 0);
        const limit = Math.min(100, Math.max(1, Number(params.limit) || 100));

        const [limitations, count] = await Promise.all([
            prisma.physicalLimitation.findMany({
                where: {
                    status: 'ACTIVE',
                },
                orderBy: { createdAt: "asc" },
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    photo: true,
                },
            }),
            prisma.physicalLimitation.count({
                where: { status: 'ACTIVE' }
            }),
        ]);

        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
                isFullFilled: true,
                data: {
                    count,
                    results: limitations.map((item) => this.formatResponse(item)),
                },
            },
        });     
    }
}

export default PhysicalLimitationController;
