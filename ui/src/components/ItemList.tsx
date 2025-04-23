import React, { useState } from "react";
import { Item } from "../types/Item";
import { priceService } from "../services/priceService";
import "./ItemList.css";
import { useHealthCheck } from "../hooks/useHeathCheck";
import { useInitialItems } from "../hooks/getInitialItems";

const ItemList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { error, isConnected, setError } = useHealthCheck();
  useInitialItems(setError, setItems);

  const handleSubscribe = async () => {
    try {
      setError(null);
      await priceService.connect();
      const unsubscribe = await priceService.subscribe((updatedItems) => {
        setItems(updatedItems);
      });
      setIsSubscribed(true);
      return () => {
        unsubscribe();
      };
    } catch (err) {
      setError("Failed to subscribe to price updates. Please try again.");
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await priceService.disconnect();
      setIsSubscribed(false);
    } catch (err) {
      setError("Failed to unsubscribe from price updates. Please try again.");
      console.error("Error unsubscribing from updates:", err);
    }
  };

  return (
    <div className="item-list-container">
      <p>isConnected:{String(isConnected)}</p>
      {error && <div className="error-message">{error}</div>}

      <div className="status-indicator">
        <span
          className={`status-dot ${isConnected ? "connected" : "disconnected"}`}
        ></span>
        <span className="status-text">
          {isConnected ? "Connected to backend" : "Disconnected from backend"}
        </span>
      </div>

      <div className="controls">
        <button
          onClick={handleSubscribe}
          disabled={isSubscribed || !isConnected}
          className="subscribe-btn"
        >
          Subscribe to Updates
        </button>
        <button
          onClick={handleUnsubscribe}
          disabled={!isSubscribed}
          className="unsubscribe-btn"
        >
          Unsubscribe
        </button>
      </div>

      <table className="item-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Updated At</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>{new Date(item.updatedAt).toLocaleTimeString()}</td>
              <td>
                {item.priceChange && (
                  <span className={`price-change ${item.priceChange}`}>
                    {item.priceChange === "up" ? "↑" : "↓"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemList;
