import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import fetch from "node-fetch";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // Notify Telegram
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8070873055:AAHRpIvi56j4F2h0BhBA_uB4tyw_SCYMsVM";
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "6360165707";
      
      const message = `
🚀 New Order Received!
👤 Link: ${order.link}
🛠️ Service: ${order.service}
📊 Quantity: ${order.quantity.toLocaleString()}
💰 Amount: ₦${order.totalAmount.toLocaleString()}
📄 Receipt: ${order.receiptUrl || "No receipt uploaded"}
      `;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
        }),
      });

      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  const httpServer = createServer(app);
  return httpServer;
}
