import dotenv from "dotenv";
import { io } from "socket.io-client";
import RealtimeData from "../models/RealtimeData.js";

dotenv.config();

const simulatorUrl = process.env.SIMULATOR_URL || "http://localhost:4000";
let socket;
let reconnectTimer;

const normalizeTimestamp = (value) => {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
};

const persistRealtime = async (payload) => {
  if (!payload || typeof payload !== "object") return;

  const timestamp = normalizeTimestamp(payload.timestamp);
  if (Number.isNaN(timestamp.getTime())) return;

  const nextRecord = {
    heart_rate: payload.heart_rate,
    spo2: payload.spo2,
    stress_level: payload.stress_level,
    steps: payload.steps,
    calories_burned: payload.calories_burned,
    timestamp,
  };

  try {
    await RealtimeData.create(nextRecord);
  } catch (error) {
    console.error("Failed to persist simulator realtime data:", error.message);
  }
};

const scheduleReconnect = () => {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectSimulatorBridge();
  }, 5000);
};

export const connectSimulatorBridge = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.close();
  }

  socket = io(simulatorUrl, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on("connect", () => {
    console.log(`Connected to simulator at ${simulatorUrl}`);
  });

  socket.on("realtimeData", async (data) => {
    await persistRealtime(data);
  });

  socket.on("overrideSet", async (data) => {
    await persistRealtime(data);
  });

  socket.on("connect_error", (error) => {
    console.error("Simulator bridge connection error:", error.message);
    scheduleReconnect();
  });

  socket.on("disconnect", (reason) => {
    console.warn("Simulator bridge disconnected:", reason);
    scheduleReconnect();
  });
};
