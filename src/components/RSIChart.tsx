import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

interface KlineData {
  timestamp: number;
  close: number;
}

type TimeFrame = "1h" | "4h" | "1d" | "1w" | "1M";

interface RSIChartProps {
  timeFrame: TimeFrame;
}

export const RSIChart = ({ timeFrame }: RSIChartProps) => {
  const [rsiData, setRsiData] = useState<{ timestamp: number; rsi: number }[]>([]);

  const calculateRSI = (prices: number[], period: number = 14) => {
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? -change : 0);

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

    const rsiValues: number[] = [];
    
    for (let i = period; i < changes.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      rsiValues.push(rsi);
    }

    return rsiValues;
  };

  const fetchKlineData = async () => {
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/klines",
        {
          params: {
            symbol: "BTCUSDT",
            interval: timeFrame,
            limit: 100
          }
        }
      );

      const klineData: KlineData[] = response.data.map((kline: any) => ({
        timestamp: kline[0],
        close: parseFloat(kline[4])
      }));

      const prices = klineData.map(d => d.close);
      const rsiValues = calculateRSI(prices);

      const rsiDataPoints = klineData.slice(14).map((kline, i) => ({
        timestamp: kline.timestamp,
        rsi: rsiValues[i]
      }));

      setRsiData(rsiDataPoints);
      console.log(`RSI data calculated for ${timeFrame}:`, rsiDataPoints);
    } catch (error) {
      console.error("Error fetching kline data:", error);
    }
  };

  useEffect(() => {
    fetchKlineData();
    const interval = setInterval(fetchKlineData, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, [timeFrame]);

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <h2 className="text-xl font-semibold mb-4">RSI 走勢圖</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rsiData}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              stroke="#888888"
            />
            <YAxis domain={[0, 100]} stroke="#888888" />
            <Tooltip
              labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
              contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
            />
            <Line
              type="monotone"
              dataKey="rsi"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};