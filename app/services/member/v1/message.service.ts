import { Prisma } from "@prisma/client";
import prisma from "../../../../prisma/client";

class MessageService {
    async findAll(where: Prisma.MessageWhereInput) {
        const messages = await prisma.message.findMany({
            where,
            include: {
                conversation: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                },
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        code: true,
                        profile: {
                            select: {
                                profilePhoto: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        messageReactions: true
                    }
                }
            }
        });

        return messages;
    }

    async findByPaginate(
        page: number,
        perPage: number,
        where?: Prisma.MessageWhereInput,
    ) {
        const messages = await prisma.message.findMany({
            where,
            orderBy: { id: "desc" },
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                conversation: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                },
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        code: true,
                        profile: {
                            select: {
                                profilePhoto: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        messageReactions: true
                    }
                }
            }
        });

        const totalMessages = await prisma.message.count({
            where,
        });

        return {
            data: messages,
            meta: {
                totalCount: totalMessages,
                totalPages: Math.ceil(totalMessages / perPage),
                currentPage: page,
                perPage,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < Math.ceil(totalMessages / perPage) ? page + 1 : null,
                hasPrevPage: page > 1,
                hasNextPage: page < Math.ceil(totalMessages / perPage),
            },
        };
    }

    async findOne(id: number, memberId: number) {
        const message = await prisma.message.findUnique({
            where: {
                id,
                conversation: {
                    participants: {
                        some: {
                            memberId
                        }
                    }
                }
            },
            include: {
                conversation: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                },
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        code: true,
                        profile: {
                            select: {
                                profilePhoto: true,
                            }
                        }
                    },
                },
                messageReactions: {
                    select: {
                        memberId: true,
                        reaction: true
                    }
                },
                _count: {
                    select: {
                        messageReactions: true
                    }
                }
            }
        });

        return message;
    }

}

export default MessageService;
