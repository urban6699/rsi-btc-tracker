import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { TimeFrame } from "@/types/common";

interface KlineData {
  timestamp: number;
  high: number;
  low: number;
  close: number;
}

interface KDChartProps {
  timeFrame: TimeFrame;
}

export const KDChart = ({ timeFrame }: KDChartProps) => {
  const [kdData, setKdData] = useState<{ timestamp: number; k: number; d: number }[]>([]);

  const calculateKD = (data: KlineData[], period: number = 14) => {
    const calculateLowestLow = (data: KlineData[], startIndex: number, period: number) => {
      return Math.min(...data.slice(startIndex - period + 1, startIndex + 1).map(d => d.low));
    };

    const calculateHighestHigh = (data: KlineData[], startIndex: number, period: number) => {
      return Math.max(...data.slice(startIndex - period + 1, startIndex + 1).map(d => d.high));
    };

    const rsv: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const lowestLow = calculateLowestLow(data, i, period);
      const highestHigh = calculateHighestHigh(data, i, period);
      const currentClose = data[i].close;
      
      const rsvValue = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      rsv.push(rsvValue);
    }

    const k: number[] = [];
    const d: number[] = [];
    let prevK = 50;
    let prevD = 50;

    rsv.forEach((rsvValue) => {
      const currentK = (2 / 3) * prevK + (1 / 3) * rsvValue;
      k.push(currentK);
      prevK = currentK;

      const currentD = (2 / 3) * prevD + (1 / 3) * currentK;
      d.push(currentD);
      prevD = currentD;
    });

    return { k, d };
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
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4])
      }));

      const { k, d } = calculateKD(klineData);

      const kdDataPoints = klineData.slice(13).map((kline, i) => ({
        timestamp: kline.timestamp,
        k: k[i],
        d: d[i]
      }));

      setKdData(kdDataPoints);
      console.log(`KD data calculated for ${timeFrame}:`, kdDataPoints);
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
      <h2 className="text-xl font-semibold mb-4">KD 指標</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={kdData}>
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
              dataKey="k"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              name="K值"
            />
            <Line
              type="monotone"
              dataKey="d"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="D值"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
