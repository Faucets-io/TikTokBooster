import { 
  orders, 
  type Order, 
  type InsertOrder,
} from "@shared/schema";

export interface IStorage {
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private orders: Map<number, Order>;
  private currentId: number;

  constructor() {
    this.orders = new Map();
    this.currentId = 1;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentId++;
    const newOrder: Order = { 
      id,
      username: order.username,
      service: order.service,
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      receiptUrl: order.receiptUrl ?? null,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
}

export const storage = new MemStorage();
