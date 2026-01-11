import { PaymentResource } from "./payment.resource";

export class MemberTypeCollection {
    static toCollection(payments: any[]) {
        return payments;
    }

    static toCommonCollection(payments: any[]) {
        return payments.map((payment) => {
            return {
                id: payment.id,
                bankInformation: payment.bankInformation.bankAccountHolder
            }
        })
    }

    static withPagination(payment: { data: any[]; meta: any }) {
        return {
            data: this.toCollection(payment.data),
            meta: payment.meta,
        };
    }
}
