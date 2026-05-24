import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { config } from "../config";

let io: Server | null = null;

export function initWebSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.frontendUrl,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("subscribe", (assignmentId: string) => {
      if (typeof assignmentId === "string" && assignmentId) {
        socket.join(`assignment:${assignmentId}`);
      }
    });

    socket.on("unsubscribe", (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("WebSocket not initialized");
  return io;
}

export function emitJobProgress(
  assignmentId: string,
  status: string,
  progress: number
): void {
  getIO()
    .to(`assignment:${assignmentId}`)
    .emit("job:progress", { assignmentId, status, progress });
}

export function emitJobComplete(assignmentId: string): void {
  getIO()
    .to(`assignment:${assignmentId}`)
    .emit("job:complete", { assignmentId, status: "completed" });
}

export function emitJobFailed(assignmentId: string, error: string): void {
  getIO()
    .to(`assignment:${assignmentId}`)
    .emit("job:failed", { assignmentId, error });
}
