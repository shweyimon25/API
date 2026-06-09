import { Request, Response } from "express";
import prisma from "../../../../prisma/client";


class DietTypeController {
    
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

    // Get all diet types with pagination
    async getDietTypes(req: Request, res: Response) {
        const params =
            req.method === "GET" && Object.keys(req.query).length
                ? req.query
                : req.body?.params ?? {};
        const offset = Math.max(0, Number(params.offset) || 0);
        const limit = Math.min(100, Math.max(1, Number(params.limit) || 100));

        const [dietTypes, count] = await Promise.all([
            prisma.dietType.findMany({
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
            prisma.dietType.count({
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
                    results: dietTypes.map((item) => this.formatResponse(item)),
                },
            },
        });     
    }
}

export default DietTypeController;
