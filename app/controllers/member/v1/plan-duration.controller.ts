import { Request, Response } from "express";
import prisma from "../../../../prisma/client";

class PlanDurationController {
  async list(req: Request, res: Response) {
    const [count, durations] = await Promise.all([
      prisma.planDuration.count(),
      prisma.planDuration.findMany({ orderBy: { id: "asc" } }),
    ]);

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          count,
          results: durations.map((duration) => ({
            id: duration.id,
            name: duration.name,
            value: duration.value,
          })),
        },
      },
    });
  }
}

export default PlanDurationController;
