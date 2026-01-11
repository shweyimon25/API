export class PaymentResource {
  static toResource(payment: any) {
    return {
      id: payment.id,
      memberPlanId: payment.memberPlanId,
      memberTypeId: payment.memberTypeId,
      bankInformationId: payment.bankInformationId,
      amount: payment.amount,
      member: payment.member,
      memberPlan: payment.memberPlan,
      memberType: payment.memberType,
      bankInformation: payment.bankInformation,
      attachment: payment.attachment,
      requestDate: payment.requestDate,
      status: payment.status,
    };
  }
}
