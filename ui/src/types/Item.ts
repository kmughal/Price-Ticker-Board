export interface Item {
  id: number;
  name: string;
  price: number;
  updatedAt: string;
  priceChange?: 'up' | 'down' | 'same';
} 