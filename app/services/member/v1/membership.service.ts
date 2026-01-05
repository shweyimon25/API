import { Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { TrainerMemberRequestInput } from "../../../schemas/member/v1/membership.schema";
import { NotFoundException } from "../../../helpers/exceptions";

class MembershipService {
    async trainerMemberRequest(trainerMemberRequestInput: TrainerMemberRequestInput) {
        const { memberPlanId, age, email, phone, yearOfExp, reason } = trainerMemberRequestInput;

        const memberPlan = await prisma.memberPlan.findFirst({
            where: {
                id: memberPlanId,
                status: Status.ACTIVE,
                memberTypeId: 2
            },
            include: {
                memberType: true,
            }
        });

        if (!memberPlan) {
            throw new NotFoundException("Member plan not found");
        }

        console.log(memberPlan);
    }

    async gymMemberRequest() {

    }
}

export default MembershipService;