import { Request, Response } from "express";

class MemberSocialPostReactionController {
  async memberPostReacts(req: Request, res: Response) {
    console.log(req.body);
  }

  async memberPostReactCheck(req: Request, res: Response) {
    console.log(req.body);
  }
}

export default MemberSocialPostReactionController;
