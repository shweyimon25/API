import { Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { CreatePaymentInput } from "../../../schemas/member/v1/payment.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";

class PaymentService {
    async create(createPaymentInput: CreatePaymentInput, memberId: number, files: Express.Multer.File[]) {
        const { memberPlanId, memberTypeId, amount, bankInformationId } = createPaymentInput;

        // Check member plan is existed
        const memberPlan = await prisma.memberPlan.findFirst({
            where: {
                id: memberPlanId,
                status: Status.ACTIVE,
                memberTypeId
            },
        });

        if (!memberPlan) {
            throw new ValidationException("Failed to create payment", [
                {
                    field: "memberPlanId",
                    issue: "Member plan is not existed",
                },
            ]);
        }

        // Check member type 
        const memberType = await prisma.memberType.findFirst({
            where: {
                id: memberTypeId,
                status: Status.ACTIVE,
            },
        });

        if (!memberType) {
            throw new ValidationException("Failed to create payment", [
                {
                    field: "memberTypeId",
                    issue: "Member type is not existed",
                },
            ]);
        }

        // Check bank information is existed
        const bankInformation = await prisma.bankInformation.findFirst({
            where: {
                id: bankInformationId,
                status: Status.ACTIVE,
            },
        });

        if (!bankInformation) {
            throw new ValidationException("Failed to create payment", [
                {
                    field: "bankInformationId",
                    issue: "Bank information is not existed",
                },
            ]);
        }

        // Member plan id and member type id must be match 
        if (memberPlan.memberTypeId !== memberTypeId) {
            throw new ValidationException("Failed to create payment", [
                {
                    field: "memberPlanId",
                    issue: "Member plan and member type must be match",
                },
            ]);
        }

        // Upload attachment
        const attachmentFiles = files.filter((file: Express.Multer.File) => file.fieldname === "attachment");

        const attachments = await Promise.all(
            attachmentFiles.map(async (file: Express.Multer.File) => {
                const { fileUrl } = await upload(file, "payment-attachments");
                return fileUrl;
            })
        );

        if (attachments.length === 0) {
            throw new ValidationException("Failed to create payment", [
                {
                    field: "attachment",
                    issue: "Attachment is required",
                },
            ]);
        }

        const payment = await prisma.payment.create({
            data: {
                memberId,
                memberPlanId,
                memberTypeId,
                bankInformationId,
                amount,
                attachment: attachments[0],
            },
        });

        return payment;
    }
}

export default PaymentService;