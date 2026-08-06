import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { updateProfileSchema } from "../../../schemas/admin/v1/profile.schema";
import { ValidationException } from "../../../helpers/exceptions";
import ProfileService from "../../../services/admin/v1/profile.service";
import { UserWithRole } from "../../../helpers/permission";
import { getUploadedFile } from "../../../helpers/upload";

const AVATARS_PUBLIC_PREFIX = "/public/avatars/";

function ensureAvatarUrlBelongsToThisHost(req: Request, profileCover?: string) {
  if (!profileCover) return;

  const expectedOrigin = `${req.protocol}://${req.get("host")}`;
  const avatarUrl = new URL(profileCover);

  if (
    avatarUrl.origin !== expectedOrigin ||
    !avatarUrl.pathname.startsWith(AVATARS_PUBLIC_PREFIX)
  ) {
    throw new ValidationException("Profile update failed", [
      {
        field: "profileCover",
        issue: "Profile photo must be selected from the available avatars",
      },
    ]);
  }
}

class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  async me(req: Request, res: Response) {
    const user = req.user as UserWithRole;
    const profile = await this.profileService.findMe(user.id);
    return successResponse(res, "Profile retrieved successfully", profile);
  }

  async updateMe(req: Request, res: Response) {
    const { data, error, success } = await validater(
      updateProfileSchema,
      req.body,
    );

    if (!success) {
      throw new ValidationException("Profile update failed", error);
    }

    ensureAvatarUrlBelongsToThisHost(req, data.profileCover);

    const user = req.user as UserWithRole;
    const profileCoverFile = getUploadedFile(req.files, "profileCover");
    const profile = await this.profileService.updateMe(
      user.id,
      data,
      profileCoverFile,
    );

    return successResponse(res, "Profile updated successfully", profile);
  }
}

export default ProfileController;
