import { Status } from "@prisma/client";
import prisma from "../../../../prisma/client";

class MemberTypeService {
  async findAll() {
    const memberTypes = await prisma.memberType.findMany({
      orderBy: {
        id: "desc",
      },
      where: {
        status: Status.ACTIVE
      }
    });

    return memberTypes;
  }
}

export default MemberTypeService;
