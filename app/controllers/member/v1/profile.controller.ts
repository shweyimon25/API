import { Member } from "@prisma/client";
import { ValidationException } from "../../../helpers/exceptions";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { changePasswordSchema, updateProfileSchema } from "../../../schemas/member/v1/profie.schema";
import ProfileService from "../../../services/member/v1/profile.service";
import { Request, Response } from "express";

class ProfileController {
    private profileService: ProfileService;

    constructor() {
        this.profileService = new ProfileService();
    }

    async profile(req: Request, res: Response) {
        const member = await this.profileService.profile((req.user as Member).id);
        return successResponse(res, "Profile fetched successfully", member);
    }

    async update(req: Request, res: Response) {
        const { data, error, success } = await validater(updateProfileSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to update profile", error);
        }

        const member = await this.profileService.update((req.user as Member).id, data);
        return successResponse(res, "Profile updated successfully", member);
    }

    async changePassword(req: Request, res: Response) {
        const { data, error, success } = await validater(changePasswordSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to change password", error);
        }

        const member = await this.profileService.changePassword((req.user as Member).id, data);
        return successResponse(res, "Password changed successfully", member);
    }
}

export default ProfileController;