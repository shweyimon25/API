import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/client";
import { ConversationStatus, ConversationType, Status } from "@prisma/client";
import { validater } from "../helpers/validator";
import { createMessageSchema } from "../schemas/member/v1/message.schema";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function initializeSocket(server: HttpServer) {
    const io = new Server(server, {
        cors: { origin: "*" },
        path: "/socket.io",
    });

    // JWT Authentication Middleware 
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token
                || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '')
                || socket.handshake.headers.authorization;

            if (!token) {
                return next(new Error("Unauthorized"));
            }

            const payload = jwt.verify(token, JWT_SECRET) as { id: number, loginType: string };

            if (payload.loginType !== "member") {
                return next(new Error("Member access required"));
            }

            (socket as any).memberid = payload.id;
            next();
        } catch (error) {
            return next(new Error("Unauthorized"));
        }
    });

    io.on("connection", async (socket: Socket) => {
        const memberId = (socket as any).memberid;

        socket.join(`member_${memberId}`); // Room for private messages to this member

        // Private Message 
        socket.on("private:message", async (payload: { to: number, content: string }) => {
            try {
                const { data, success } = await validater(createMessageSchema, payload);

                if (!success) {
                    socket.emit("private:message", {
                        status: false,
                        message: "Payload are required"
                    });
                    return;
                }

                const { to, content, attachments } = data;

                const existingToMember = await prisma.member.findUnique({
                    where: { id: +to, NOT: { id: memberId }, status: Status.ACTIVE },
                    include: { friends: true, friendsOf: true },
                });

                if (!existingToMember) {
                    socket.emit("private:message", {
                        status: false,
                        message: "User not found"
                    });
                    return;
                }

                let conversationId: number;

                // Get or create private conversation
                const conversation = await prisma.conversation.findFirst({
                    where: {
                        type: ConversationType.PRIVATE,
                        participants: {
                            every: {
                                memberId: { in: [memberId, to] }
                            }
                        }
                    }
                });

                // Check if friend 
                const isFriend =
                    existingToMember.friends.some(f => f.friendId === memberId) ||
                    existingToMember.friendsOf.some(f => f.memberId === memberId);

                // If conversation not found, create a new one & add participants
                if (!conversation) {
                    const { conversation } = await prisma.$transaction(async (tx) => {
                        const conversation = await tx.conversation.create({
                            data: { type: ConversationType.PRIVATE, status: isFriend ? ConversationStatus.ACCEPTED : ConversationStatus.REQUESTED },
                        });

                        await tx.conversationParticipant.create({
                            data: { conversationId: conversation.id, memberId: memberId }
                        });

                        await tx.conversationParticipant.create({
                            data: { conversationId: conversation.id, memberId: to }
                        });

                        return { conversation };
                    });

                    conversationId = conversation.id;
                } else {
                    conversationId = conversation.id;
                }

                // If request true. Need to update false by send to member id
                if (conversation?.status === ConversationStatus.REQUESTED) {
                    const firstMessage = await prisma.message.findFirst({
                        where: { conversationId },
                        orderBy: { id: "asc" },
                        select: { senderId: true }
                    });

                    const shouldAcceptRequest =
                        isFriend || !firstMessage || firstMessage.senderId !== memberId;

                    if (shouldAcceptRequest) {
                        socket.emit("private:message", { message: "If you want to return message.You need to accept the conversation first!" });
                        return;
                    }
                }

                // Create message 
                const message = await prisma.message.create({
                    data: {
                        conversationId,
                        senderId: memberId,
                        content,
                        attachments
                    }
                });

                io.to(`member_${to}`).emit("private:message", {
                    status: true,
                    message: "Message sent successfully",
                    data: message
                });

                socket.emit("private:message", {
                    status: true,
                    message: "Message sent successfully",
                    data: message
                });
            } catch (error) {
                socket.emit("private:message", {
                    status: false,
                    message: error instanceof Error ? error.message : "Failed to send message"
                });
            }
        });

        // Group Message 
        socket.on("group:message", async (payload: { conversationId: number; content: string }) => {
            const { data, success } = await validater(createMessageSchema, payload);

            if (!success) {
                socket.emit("group:message", {
                    status: false,
                    message: "Payload is required"
                });
                return;
            }

            const { conversationId, content, attachments } = data;

            // Check if the user is a participant of the group
            const participant = await prisma.conversationParticipant.findFirst({
                where: { conversationId: +conversationId, memberId }
            });

            if (!participant) {
                socket.emit("group:message", {
                    status: false,
                    message: "You are not a participant of this group"
                });
                return;
            }

            const message = await prisma.message.create({
                data: { conversationId: +conversationId, senderId: memberId, content, attachments }
            });

            socket.emit("group:message", {
                status: true,
                message: "Message sent successfully",
                data: message
            });

            io.to(`conversation:${conversationId}`).emit("group:message", {
                status: true,
                message: "Message sent successfully",
                data: message
            });
        });

        socket.on("disconnect", () => { });
    });

    return io;
};