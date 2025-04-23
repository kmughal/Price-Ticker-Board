import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { Item } from "../types/Item";

const API = {
  subscribe: "http://localhost:5000/api/items/subscribe",
  unsubscribe: "http://localhost:5000/api/items/unsubscribe",
  items: "http://localhost:5000/api/items",
  health: "http://localhost:5000/api/items/health",
  priceHub: "http://localhost:5000/priceHub",
};

class PriceService {
  private connection: HubConnection | null = null;
  private subscribers: ((items: Item[]) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // 2 seconds

  async connect() {
    if (this.connection) return;

    this.connection = new HubConnectionBuilder()
      .withUrl(API.priceHub)
      .withAutomaticReconnect([0, 2000, 5001, 10000, 20000]) // Retry intervals in milliseconds
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on("ReceivePriceUpdate", (items: Item[]) => {
      console.log("🔥 Received update:", items);
      this.notifySubscribers(items);
    });

    this.connection.onreconnecting((error) => {
      console.log("Reconnecting to SignalR hub...", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log(
        "Reconnected to SignalR hub with connection ID:",
        connectionId
      );
      this.reconnectAttempts = 0;
    });

    this.connection.onclose((error) => {
      console.log("Connection to SignalR hub closed", error);
      this.connection = null;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
        );
        setTimeout(() => this.connect(), this.reconnectDelay);
      } else {
        console.error("Max reconnection attempts reached");
      }
    });

    try {
      await this.connection.start();
      console.log("Connected to SignalR hub");
      this.reconnectAttempts = 0;
    } catch (err) {
      console.error("Error connecting to SignalR hub:", err);
      this.connection = null;
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
        const response = await fetch(API.unsubscribe, { method: "POST" });
        if (!response.ok) {
          throw new Error(
            `Failed to subscribe to price updates: ${response.status} ${response.statusText}`
          );
        }
        console.log("Disconnected from SignalR hub");
      } catch (err) {
        console.error("Error disconnecting from SignalR hub:", err);
      } finally {
        this.connection = null;
      }
    }
  }

  async subscribe(callback: (items: Item[]) => void) {
    const response = await fetch(API.subscribe, { method: "POST" });
    if (!response.ok) {
      throw new Error(
        `Failed to subscribe to price updates: ${response.status} ${response.statusText}`
      );
    }
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  private notifySubscribers(items: Item[]) {
    this.subscribers.forEach((callback) => callback(items));
  }

  async getInitialItems(): Promise<Item[]> {
    try {
      const response = await fetch(API.items);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch initial items: ${response.status} ${response.statusText}`
        );
      }
      const items = await response.json();
      console.log("Retrieved initial items:", items.length);
      return items;
    } catch (err) {
      console.error("Error fetching initial items:", err);
      return [];
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(API.health);
      if (!response.ok) {
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error checking health:", err);
      return false;
    }
  }
}

export const priceService = new PriceService();
