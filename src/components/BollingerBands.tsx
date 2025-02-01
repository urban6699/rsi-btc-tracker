import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

interface KlineData {
  timestamp: number;
  close: number;
}

export const BollingerBands = () => {
  const [bbData, setBBData] = useState<{ timestamp: number; upper: number; middle: number; lower: number; price: number }[]>([]);

  const calculateBollingerBands = (prices: number[], period: number = 20, multiplier: number = 2) => {
    const sma = prices.map((_, i) => {
      if (i < period - 1) return null;
      const slice = prices.slice(i - period + 1, i + 1);
      return slice.reduce((sum, price) => sum + price, 0) / period;
    });

    const stdDev = prices.map((_, i) => {
      if (i < period - 1) return null;
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i]!;
      const squaredDiffs = slice.map(price => Math.pow(price - mean, 2));
      return Math.sqrt(squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period);
    });

    return prices.map((price, i) => {
      if (i < period - 1) return { upper: null, middle: null, lower: null };
      return {
        upper: sma[i]! + multiplier * stdDev[i]!,
        middle: sma[i]!,
        lower: sma[i]! - multiplier * stdDev[i]!
      };
    });
  };

  const fetchKlineData = async () => {
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/klines",
        {
          params: {
            symbol: "BTCUSDT",
            interval: "1h",
            limit: 100
          }
        }
      );

      const klineData: KlineData[] = response.data.map((kline: any) => ({
        timestamp: kline[0],
        close: parseFloat(kline[4])
      }));

      const prices = klineData.map(d => d.close);
      const bands = calculateBollingerBands(prices);

      const bbDataPoints = klineData.map((kline, i) => ({
        timestamp: kline.timestamp,
        price: kline.close,
        ...bands[i]
      }));

      setBBData(bbDataPoints.filter(d => d.middle !== null));
      console.log("Bollinger Bands data calculated:", bbDataPoints);
    } catch (error) {
      console.error("Error fetching kline data:", error);
    }
  };

  useEffect(() => {
    fetchKlineData();
    const interval = setInterval(fetchKlineData, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <h2 className="text-xl font-semibold mb-4">布林帶指標</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={bbData}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              stroke="#888888"
            />
            <YAxis stroke="#888888" />
            <Tooltip
              labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
              contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
            />
            <Line
              type="monotone"
              dataKey="upper"
              stroke="#60a5fa"
              strokeWidth={1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="middle"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="lower"
              stroke="#60a5fa"
              strokeWidth={1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};