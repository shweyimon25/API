import { PaymentRequestType, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { CreatePaymentInput } from "../../../schemas/member/v1/payment.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";

class PaymentService {
    async create(createPaymentInput: CreatePaymentInput, memberId: number, files: Express.Multer.File[]) {
        const { memberPlanId, memberTypeId, shopLevelId, requestType, amount, bankInformationId } = createPaymentInput;

        if (requestType === PaymentRequestType.MEMBER_PLAN_UPGRADE) {
            return this.memberPlanUpgrade(memberId, memberPlanId, memberTypeId, amount, bankInformationId, files);
        }

        if (requestType === PaymentRequestType.SHOP_LEVEL_UPGRADE) {
            return this.shopLevelUpgrade(memberId, shopLevelId, amount, bankInformationId, files);
        }
    }

    async memberPlanUpgrade(
        memberId: number,
        memberPlanId: number | undefined,
        memberTypeId: number | undefined,
        amount: number,
        bankInformationId: number,
        files: Express.Multer.File[]
    ) {
        // Validate required fields
        if (!memberPlanId || !memberTypeId) {
            throw new ValidationException("Failed to create payment", [
                {
                    field: "memberPlanId",
                    issue: "Member plan and member type are required for MEMBER_PLAN_UPGRADE",
                },
            ]);
        }

        // Check member plan is existed
        const memberPlan = await prisma.memberPlan.findFirst({
            where: {
                id: memberPlanId,
                status: Status.ACTIVE,
                memberTypeId,
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

        // Member plan id and member type id must be match 
        if (memberPlan.memberTypeId !== memberTypeId) {
            throw new ValidationException("Failed to create payment", [
                {
                    field: "memberPlanId",
                    issue: "Member plan and member type must be match",
                },
            ]);
        }

        return this.createPayment(
            PaymentRequestType.MEMBER_PLAN_UPGRADE,
            memberId,
            memberPlanId,
            memberTypeId,
            null,
            amount,
            bankInformationId,
            files
        );
    }

    async shopLevelUpgrade(
        memberId: number,
        shopLevelId: number | undefined,
        amount: number,
        bankInformationId: number,
        files: Express.Multer.File[]
    ) {
        // Validate required fields
        if (!shopLevelId) {
            throw new ValidationException("Failed to create payment", [
                {
                    field: "shopLevelId",
                    issue: "Shop level is required for SHOP_LEVEL_UPGRADE",
                },
            ]);
        }

        // Check shop level is existed
        const shopLevel = await prisma.shopLevel.findFirst({
            where: {
                id: shopLevelId,
                status: Status.ACTIVE,
            },
        });

        if (!shopLevel) {
            throw new ValidationException("Failed to create payment", [
                {
                    field: "shopLevelId",
                    issue: "Shop level is not existed",
                },
            ]);
        }

        // Check member has a shop
        const shop = await prisma.shop.findFirst({
            where: {
                memberId,
                status: Status.ACTIVE,
            },
        });

        if (!shop) {
            throw new ValidationException("Failed to create payment", [
                {
                    field: "memberId",
                    issue: "Member does not have a shop",
                },
            ]);
        }

        return this.createPayment(
            PaymentRequestType.SHOP_LEVEL_UPGRADE,
            memberId,
            null,
            null,
            shopLevelId,
            amount,
            bankInformationId,
            files
        );
    }

    private async createPayment(
        requestType: PaymentRequestType,
        memberId: number,
        memberPlanId: number | null | undefined,
        memberTypeId: number | null | undefined,
        shopLevelId: number | null | undefined,
        amount: number,
        bankInformationId: number,
        files: Express.Multer.File[]
    ) {
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
                requestType,
                memberPlanId: requestType === PaymentRequestType.MEMBER_PLAN_UPGRADE ? memberPlanId : null,
                memberTypeId: requestType === PaymentRequestType.MEMBER_PLAN_UPGRADE ? memberTypeId : null,
                shopLevelId: requestType === PaymentRequestType.SHOP_LEVEL_UPGRADE ? shopLevelId : null,
                bankInformationId,
                amount,
                attachment: attachments[0],
            },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        code: true,
                        memberType: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                memberPlan: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        duration: true,
                    }
                },
                memberType: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                bankInformation: {
                    select: {
                        id: true,
                        bankAccountHolder: true,
                        bankAccountNumber: true,
                        phone: true,
                        paymentTypes: true,
                        coverPhoto: true,
                    }
                },
                shopLevel: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        duration: true,
                        description: true,
                        postLimit: true,
                    }
                }
            }
        });

        return payment;
    }
}

export default PaymentService;