import { Request, Response } from "express";
import prisma from "../../../../prisma/client";
class SystemParameterController {

  async findInfo(req: Request, res: Response) {
    const systemParameter = await prisma.systemParameter.findMany({
        where: {
        key: { in: ['ip_address', 'is_eligible_for_purchase'] }
        }
    });
    const config = Object.fromEntries(systemParameter.map(s => [s.key, s.value]));

    res.json({
      "jsonrpc": "2.0",
      "id": null,
      "result": {
          isFullFilled: true,
          message: 'Hello Frontend',
          data: {
          ip_address: config.ip_address,
          is_eligible_for_purchase: config.is_eligible_for_purchase 
          }
      }
    });
  }

}

export default SystemParameterController;

