export class PaymentResource {
  static toResource(payment: any) {
    return {
      id: payment.id,
      amount: payment.amount,
      member: payment.member,
      memberPlan: payment.memberPlan,
      memberType: payment.memberType,
      shopLevel: payment.shopLevel,
      bankInformation: payment.bankInformation,
      attachment: payment.attachment,
      requestType: payment.requestType,
      requestDate: payment.requestDate,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
