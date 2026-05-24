import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, { transports: ["websocket", "polling"] });
  }
  return socket;
}

export function subscribeToAssignment(
  assignmentId: string,
  handlers: {
    onProgress?: (data: {
      assignmentId: string;
      status: string;
      progress: number;
    }) => void;
    onComplete?: (data: { assignmentId: string; status: string }) => void;
    onFailed?: (data: { assignmentId: string; error: string }) => void;
  }
): () => void {
  const s = getSocket();
  s.emit("subscribe", assignmentId);

  const progressHandler = handlers.onProgress;
  const completeHandler = handlers.onComplete;
  const failedHandler = handlers.onFailed;

  if (progressHandler) s.on("job:progress", progressHandler);
  if (completeHandler) s.on("job:complete", completeHandler);
  if (failedHandler) s.on("job:failed", failedHandler);

  return () => {
    s.emit("unsubscribe", assignmentId);
    if (progressHandler) s.off("job:progress", progressHandler);
    if (completeHandler) s.off("job:complete", completeHandler);
    if (failedHandler) s.off("job:failed", failedHandler);
  };
}
