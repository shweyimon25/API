import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import OverviewService from "../../../services/admin/v1/overview.service";

class OverviewController {
  private overviewService: OverviewService;

  constructor() {
    this.overviewService = new OverviewService();
  }

  async stats(req: Request, res: Response) {
    const stats = await this.overviewService.getStats();
    return successResponse(res, "Overview stats retrieved successfully", stats);
  }
}

export default OverviewController;
