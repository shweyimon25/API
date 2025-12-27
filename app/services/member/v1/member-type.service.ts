import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";

class MemberTypeService {
  async findAll() {
    const memberTypes = await prisma.memberType.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return memberTypes;
  }

  async findOne(id: number) {
    const memberType = await prisma.memberType.findUnique({
      where: {
        id,
      },
    });

    if (!memberType) {
      throw new NotFoundException("Member type not found");
    }

    return memberType;
  }
}

export default MemberTypeService;
