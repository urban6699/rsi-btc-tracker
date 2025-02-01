import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, CompositeChart } from "recharts";
import axios from "axios";

interface KlineData {
  timestamp: number;
  close: number;
}

export const MACDChart = () => {
  const [macdData, setMacdData] = useState<{ timestamp: number; macd: number; signal: number; histogram: number }[]>([]);

  const calculateEMA = (prices: number[], period: number) => {
    const k = 2 / (period + 1);
    let ema = prices[0];
    const emaData = [ema];

    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
      emaData.push(ema);
    }
    return emaData;
  };

  const calculateMACD = (prices: number[]) => {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12.map((ema12Val, i) => ema12Val - ema26[i]);
    const signalLine = calculateEMA(macdLine, 9);
    const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

    return { macdLine, signalLine, histogram };
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
      const { macdLine, signalLine, histogram } = calculateMACD(prices);

      const macdDataPoints = klineData.map((kline, i) => ({
        timestamp: kline.timestamp,
        macd: macdLine[i],
        signal: signalLine[i],
        histogram: histogram[i]
      }));

      setMacdData(macdDataPoints);
      console.log("MACD data calculated:", macdDataPoints);
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
      <h2 className="text-xl font-semibold mb-4">MACD 指標</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <CompositeChart data={macdData}>
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
              dataKey="macd"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="signal"
              stroke="#f87171"
              strokeWidth={2}
              dot={false}
            />
            <Bar
              dataKey="histogram"
              fill={(data: any) => (data.histogram >= 0 ? "#34d399" : "#ef4444")}
            />
          </CompositeChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};