import { PaymentResource } from "./payment.resource";

export class PaymentCollection {
    static toCollection(payments: any[]) {
        return payments.map((payment) => {
            return PaymentResource.toResource(payment);
        });
    }

    static toCommonCollection(payments: any[]) {
        return payments.map((payment) => {
            return {
                id: payment.id,
                bankInformation: payment.bankInformation,
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
