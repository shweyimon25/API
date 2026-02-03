import { Request, Response } from "express";
import { Member } from "@prisma/client";
import FriendService from "../../../services/member/v1/friend.service";
import { successResponse } from "../../../helpers/response";
import { FriendCollection } from "../../../resources/member/v1/friend/friend.collection";
import { FriendResource } from "../../../resources/member/v1/friend/friend.resource";

class FriendController {
  private friendService: FriendService;

  constructor() {
    this.friendService = new FriendService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;
    const memberId = (req.user as Member).id;

    if (page && perPage) {
      const result = await this.friendService.findByPaginate(
        memberId,
        +page,
        +perPage
      );
      return successResponse(
        res,
        "Friends list successfully",
        FriendCollection.withPagination(result)
      );
    }

    const friends = await this.friendService.findAll(memberId);
    return successResponse(
      res,
      "Friends list successfully",
      FriendCollection.toCollection(friends)
    );
  }

  async findOne(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const id = +req.params.id;
    const friend = await this.friendService.findOne(memberId, id);
    return successResponse(
      res,
      "Friend fetched successfully",
      FriendResource.toResource(friend)
    );
  }

  async destroy(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const id = +req.params.id;
    await this.friendService.remove(memberId, id);
    return successResponse(res, "Friend removed successfully");
  }
}

export default FriendController;
