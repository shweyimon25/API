import { PaymentRequestType, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { CreatePaymentInput } from "../../../schemas/member/v1/payment.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";

export type RpcPaymentParams = {
    bank_id: number;
    partner_id?: number;
    bank_name?: string;
    client_account_number?: string;
    client_account_holder?: string;
    client_phone?: string;
    request_type: "plan" | "shop";
    member_plan_id?: number;
    shop_level_id?: number;
    amount: number;
    photo?: string;
};

class PaymentService {
    async createFromRpcParams(params: RpcPaymentParams, memberId: number) {
        const bankInformationId = Number(params.bank_id);
        const amount = Number(params.amount);
        const attachment = params.photo?.trim() ? String(params.photo).trim() : "";

        if (!Number.isInteger(bankInformationId) || bankInformationId <= 0) {
            throw new ValidationException("Failed to create payment", [
                { field: "bank_id", issue: "Bank is required" },
            ]);
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            throw new ValidationException("Failed to create payment", [
                { field: "amount", issue: "Amount must be greater than 0" },
            ]);
        }

        if (
            params.partner_id != null &&
            Number(params.partner_id) !== memberId
        ) {
            throw new ValidationException("Failed to create payment", [
                { field: "partner_id", issue: "Partner does not match logged-in member" },
            ]);
        }

        const bankInformation = await prisma.bankInformation.findFirst({
            where: { id: bankInformationId, status: Status.ACTIVE },
        });

        if (!bankInformation) {
            throw new ValidationException("Failed to create payment", [
                { field: "bank_id", issue: "Bank information is not existed" },
            ]);
        }

        if (
            params.bank_name &&
            bankInformation.name.toLowerCase() !== params.bank_name.toLowerCase()
        ) {
            throw new ValidationException("Failed to create payment", [
                { field: "bank_name", issue: "Bank name does not match selected bank" },
            ]);
        }

        if (params.request_type === "plan") {
            const memberPlanId = Number(params.member_plan_id);
            if (!Number.isInteger(memberPlanId) || memberPlanId <= 0) {
                throw new ValidationException("Failed to create payment", [
                    { field: "member_plan_id", issue: "Member plan is required" },
                ]);
            }

            const memberPlan = await prisma.memberPlan.findFirst({
                where: { id: memberPlanId, status: Status.ACTIVE },
            });

            if (!memberPlan) {
                throw new ValidationException("Failed to create payment", [
                    { field: "member_plan_id", issue: "Member plan is not existed" },
                ]);
            }

            return this.createPaymentRecord(
                PaymentRequestType.MEMBER_PLAN_UPGRADE,
                memberId,
                memberPlanId,
                memberPlan.memberTypeId,
                null,
                amount,
                bankInformationId,
                attachment
            );
        }

        if (params.request_type === "shop") {
            const shopLevelId = Number(
                params.shop_level_id ?? params.member_plan_id
            );

            if (!Number.isInteger(shopLevelId) || shopLevelId <= 0) {
                throw new ValidationException("Failed to create payment", [
                    {
                        field: "shop_level_id",
                        issue: "Shop level is required for shop payment",
                    },
                ]);
            }

            const shopLevel = await prisma.shopLevel.findFirst({
                where: { id: shopLevelId, status: Status.ACTIVE },
            });

            if (!shopLevel) {
                throw new ValidationException("Failed to create payment", [
                    { field: "shop_level_id", issue: "Shop level is not existed" },
                ]);
            }

            const shop = await prisma.shop.findFirst({
                where: { memberId, status: Status.ACTIVE },
            });

            if (!shop) {
                throw new ValidationException("Failed to create payment", [
                    { field: "partner_id", issue: "Member does not have a shop" },
                ]);
            }

            return this.createPaymentRecord(
                PaymentRequestType.SHOP_LEVEL_UPGRADE,
                memberId,
                null,
                null,
                shopLevelId,
                amount,
                bankInformationId,
                attachment
            );
        }

        throw new ValidationException("Failed to create payment", [
            {
                field: "request_type",
                issue: "Request type must be plan or shop",
            },
        ]);
    }

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
        const attachmentFiles = files.filter(
            (file: Express.Multer.File) => file.fieldname === "attachment"
        );

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

        return this.createPaymentRecord(
            requestType,
            memberId,
            memberPlanId,
            memberTypeId,
            shopLevelId,
            amount,
            bankInformationId,
            attachments[0]
        );
    }

    private async createPaymentRecord(
        requestType: PaymentRequestType,
        memberId: number,
        memberPlanId: number | null | undefined,
        memberTypeId: number | null | undefined,
        shopLevelId: number | null | undefined,
        amount: number,
        bankInformationId: number,
        attachment: string
    ) {
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

        const payment = await prisma.payment.create({
            data: {
                memberId,
                requestType,
                memberPlanId:
                    requestType === PaymentRequestType.MEMBER_PLAN_UPGRADE
                        ? memberPlanId
                        : null,
                memberTypeId:
                    requestType === PaymentRequestType.MEMBER_PLAN_UPGRADE
                        ? memberTypeId
                        : null,
                shopLevelId:
                    requestType === PaymentRequestType.SHOP_LEVEL_UPGRADE
                        ? shopLevelId
                        : null,
                bankInformationId,
                amount,
                attachment,
            },
        });

        return payment;
    }
}

export default PaymentService;