import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

let io: Server | null = null;

export const SocketEvents = {
  PROJECT_CREATED: "project:created",
  PROJECT_UPDATED: "project:updated",
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_DELETED: "task:deleted",
} as const;

export function getIO() {
  return io;
}

export function emitSocket(event: string, payload: unknown) {
  if (!io) {
    return;
  }

  io.emit(event, payload);
}

export function initializeSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: "*" },
    path: "/socket.io",
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, "") ||
        socket.handshake.headers.authorization;

      // Allow anonymous connections (e.g. public dashboard)
      if (!token) {
        socket.data.userId = null;
        return next();
      }

      const payload = jwt.verify(token, JWT_SECRET) as {
        id: number;
        loginType: string;
      };

      if (payload.loginType !== "admin") {
        return next(new Error("Admin access required"));
      }

      socket.data.userId = payload.id;
      next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as number | null;

    socket.join("realtime");

    if (userId) {
      socket.join(`user_${userId}`);
    }

    socket.on("subscribe:project", (projectId: number) => {
      if (!projectId || Number.isNaN(+projectId)) {
        return;
      }

      socket.join(`project_${+projectId}`);
    });

    socket.on("unsubscribe:project", (projectId: number) => {
      if (!projectId || Number.isNaN(+projectId)) {
        return;
      }

      socket.leave(`project_${+projectId}`);
    });

    socket.on("disconnect", () => {});
  });

  return io;
}
