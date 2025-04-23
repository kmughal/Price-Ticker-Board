import { useEffect, useState } from "react";
import { priceService } from "../services/priceService";
export function useHealthCheck() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const isHealthy = await priceService.checkHealth();
        setIsConnected(isHealthy);
        if (!isHealthy) {
          setError("Backend service is not healthy. Please try again later.");
        } else {
          setError(null);
        }
      } catch (err) {
        setIsConnected(false);
        setError("Cannot connect to backend service. Please try again later.");
        console.error("Health check failed:", err);
      }
    };

    const intervalId = setInterval(checkHealth, 30000); // Check health every 30 seconds
    checkHealth(); // Initial check

    return () => clearInterval(intervalId);
  }, []);

  return { isConnected, error ,setError };
}
