import { useEffect } from "react";
import { priceService } from "../services/priceService";
import { Item } from "../types/Item";

type ErrorType = React.Dispatch<React.SetStateAction<string | null>>;
type SetItemsType = React.Dispatch<React.SetStateAction<Item[]>>

export function useInitialItems(setError: ErrorType, setItems: SetItemsType) {
  useEffect(() => {
    try {
      setError(null);
      priceService.getInitialItems().then(setItems);
    } catch (err) {
      setError("Failed to load initial items. Please try again.");
      console.error("Health check failed:", err);
    }
  }, []);
}
