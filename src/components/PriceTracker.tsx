
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { ArrowUp, ArrowDown } from "lucide-react";

interface CryptoSymbol {
  symbol: string;
  name: string;
}

const TOP_SYMBOLS: CryptoSymbol[] = [
  { symbol: "BTCUSDT", name: "Bitcoin" },
  { symbol: "ETHUSDT", name: "Ethereum" },
  { symbol: "BNBUSDT", name: "Binance Coin" },
  { symbol: "SOLUSDT", name: "Solana" },
  { symbol: "XRPUSDT", name: "Ripple" },
  { symbol: "ADAUSDT", name: "Cardano" },
  { symbol: "DOGEUSDT", name: "Dogecoin" },
  { symbol: "DOTUSDT", name: "Polkadot" },
  { symbol: "MATICUSDT", name: "Polygon" },
  { symbol: "LINKUSDT", name: "Chainlink" },
];

export const PriceTracker = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [selectedSymbol, setSelectedSymbol] = useState<CryptoSymbol>(TOP_SYMBOLS[0]);

  const fetchPrice = async () => {
    try {
      const response = await axios.get(
        `https://api.binance.com/api/v3/ticker/price?symbol=${selectedSymbol.symbol}`
      );
      const newPrice = parseFloat(response.data.price);
      
      if (price !== null) {
        setPriceChange(((newPrice - price) / price) * 100);
      }
      
      setPrice(newPrice);
      console.log(`Fetched ${selectedSymbol.symbol} price:`, newPrice);
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">當前價格</h2>
          <select
            value={selectedSymbol.symbol}
            onChange={(e) => {
              const symbol = TOP_SYMBOLS.find(s => s.symbol === e.target.value);
              if (symbol) {
                setSelectedSymbol(symbol);
                setPrice(null);
                setPriceChange(0);
              }
            }}
            className="bg-gray-700 text-white rounded px-2 py-1 border border-gray-600"
          >
            {TOP_SYMBOLS.map((symbol) => (
              <option key={symbol.symbol} value={symbol.symbol}>
                {symbol.name}
              </option>
            ))}
          </select>
        </div>
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
      </div>
    </Card>
  );
};
