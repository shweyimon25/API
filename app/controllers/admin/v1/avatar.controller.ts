import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import AvatarService from "../../../services/admin/v1/avatar.service";

class AvatarController {
  private avatarService: AvatarService;

  constructor() {
    this.avatarService = new AvatarService();
  }

  async findAll(req: Request, res: Response) {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const avatars = await this.avatarService.findAll(baseUrl);
    return successResponse(res, "Avatar list successfully", avatars);
  }
}

export default AvatarController;
