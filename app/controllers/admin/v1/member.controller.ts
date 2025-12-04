class MemberController {
  private memberService: MemberService;

  constructor() {
    this.memberService = new MemberService();
  }
}

export default MemberController;