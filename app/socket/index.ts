import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/client";
import { MessageType, Status } from "@prisma/client";

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
                const { to, content } = payload;

                if (!to || !content) {
                    socket.emit("private:message", { message: "Recipient and content are required" });
                    return;
                }

                const existingToMember = await prisma.member.findUnique({
                    where: { id: +to, NOT: { id: memberId }, status: Status.ACTIVE }
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
                        type: "PRIVATE",
                        participants: {
                            every: {
                                memberId: { in: [memberId, to] }
                            }
                        }
                    }
                });

                // If conversation not found, create a new one
                if (!conversation) {
                    const newConversation = await prisma.conversation.create({
                        data: { type: "PRIVATE" }
                    });
                    conversationId = newConversation.id;
                } else {
                    conversationId = conversation.id;
                }

                // Create message 
                const message = await prisma.message.create({
                    data: {
                        conversationId,
                        senderId: memberId,
                        content,
                        type: MessageType.TEXT
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
            const { conversationId, content } = payload;

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
                data: { conversationId: +conversationId, senderId: memberId, content }
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