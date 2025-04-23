import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { priceService } from "../services/priceService";
import { useHealthCheck } from "../hooks/useHeathCheck";
import ItemList from "../components/ItemList";

// Mocks
jest.mock("../services/priceService");
jest.mock("../hooks/useHeathCheck");
jest.mock("../hooks/getInitialItems", () => {
  let executed = false;

  return {
    useInitialItems: (
      setError: React.Dispatch<React.SetStateAction<string | null>>,
      setItems: React.Dispatch<React.SetStateAction<any[]>>
    ) => {
      if (!executed) {
        executed = true;

        setItems([
          {
            id: "1",
            name: "Item 1",
            price: 10.5,
            updatedAt: new Date().toISOString(),
            priceChange: "up",
          },
        ]);
      }
    },
  };
});

describe("ItemList Component", () => {
  const mockSetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useHealthCheck as jest.Mock).mockReturnValue({
      isConnected: true,
      error: null,
      setError: mockSetError,
    });
  });

  it("renders the item list with data", async () => {
    render(<ItemList />);
    expect(screen.getByText("Connected to backend")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Subscribe to Updates")).toBeEnabled();
  });

  it("disables the subscribe button if already subscribed", async () => {
    (priceService.subscribe as jest.Mock).mockResolvedValue(() => {});

    render(<ItemList />);

    const subscribeButton = screen.getByText("Subscribe to Updates");
    fireEvent.click(subscribeButton);

    await waitFor(() => {
      expect(subscribeButton).toBeDisabled();
    });
  });

  it("disables subscribe button when not connected", () => {
    (useHealthCheck as jest.Mock).mockReturnValue({
      isConnected: false,
      error: null,
      setError: mockSetError,
    });

    render(<ItemList />);
    const subscribeButton = screen.getByText("Subscribe to Updates");
    expect(subscribeButton).toBeDisabled();
  });
});
