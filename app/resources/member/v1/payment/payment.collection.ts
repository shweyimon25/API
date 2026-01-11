import { PaymentResource } from "./payment.resource";

export class PaymentCollection {
  static toCollection(payments: any[]) {
    return payments.map((payment) =>
      PaymentResource.toResource(payment)
    );
  }

  static withPagination(payments: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(payments.data),
      meta: payments.meta,
    };
  }
}
