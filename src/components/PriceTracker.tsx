import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { ArrowUp, ArrowDown } from "lucide-react";

export const PriceTracker = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);

  const fetchPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
      );
      const newPrice = parseFloat(response.data.price);
      
      if (price !== null) {
        setPriceChange(((newPrice - price) / price) * 100);
      }
      
      setPrice(newPrice);
      console.log("Fetched BTC price:", newPrice);
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <h2 className="text-xl font-semibold mb-4">當前價格</h2>
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold">
          ${price?.toLocaleString() ?? "載入中..."}
        </div>
        {priceChange !== 0 && (
          <div
            className={`flex items-center ${
              priceChange >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {priceChange >= 0 ? (
              <ArrowUp className="w-5 h-5 mr-1" />
            ) : (
              <ArrowDown className="w-5 h-5 mr-1" />
            )}
            {Math.abs(priceChange).toFixed(2)}%
          </div>
        )}
      </div>
    </Card>
  );
};