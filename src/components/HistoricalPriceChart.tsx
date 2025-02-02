import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Scatter } from "recharts";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import axios from "axios";

interface KlineData {
  timestamp: number;
  price: number;
  rsi?: number;
  signal?: 'buy' | 'sell';
}

type TimeFrame = "1h" | "4h" | "1d" | "1w" | "1M";

interface HistoricalPriceChartProps {
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
}

const timeFrameLimits: Record<TimeFrame, number> = {
  "1h": 480,
  "4h": 480,
  "1d": 480,
  "1w": 480,
  "1M": 480
};

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

export const HistoricalPriceChart = ({ onTimeFrameChange }: HistoricalPriceChartProps) => {
  const [priceData, setPriceData] = useState<KlineData[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1h");

  const fetchHistoricalData = async () => {
    try {
      setIsUpdating(true);
      const response = await axios.get(
        "https://api.binance.com/api/v3/klines",
        {
          params: {
            symbol: "BTCUSDT",
            interval: timeFrame,
            limit: timeFrameLimits[timeFrame]
          }
        }
      );

      const prices = response.data.map((kline: any) => parseFloat(kline[4]));
      const rsiValues = calculateRSI(prices);

      const historicalData: KlineData[] = response.data.map((kline: any, index: number) => {
        const price = parseFloat(kline[4]);
        const rsi = rsiValues[index - 14] || undefined;
        let signal: 'buy' | 'sell' | undefined;
        
        if (rsi !== undefined) {
          if (rsi < 30) signal = 'buy';
          else if (rsi > 70) signal = 'sell';
        }

        return {
          timestamp: kline[0],
          price,
          rsi,
          signal
        };
      });

      setPriceData(historicalData);
      setLastUpdateTime(new Date());
      console.log(`Historical price data fetched for ${timeFrame}:`, historicalData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
    const interval = setInterval(fetchHistoricalData, 3600000);
    return () => clearInterval(interval);
  }, [timeFrame]);

  const handleTimeFrameChange = (value: TimeFrame) => {
    if (value) {
      setTimeFrame(value);
      onTimeFrameChange(value);
    }
  };

  const getTimeFrameLabel = (tf: TimeFrame) => {
    switch (tf) {
      case "1h": return "1小時";
      case "4h": return "4小時";
      case "1d": return "日線";
      case "1w": return "週線";
      case "1M": return "月線";
    }
  };

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">BTC/USDT 價格走勢</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              最後更新: {lastUpdateTime.toLocaleString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHistoricalData}
              disabled={isUpdating}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
              更新數據
            </Button>
          </div>
        </div>
        
        <ToggleGroup
          type="single"
          value={timeFrame}
          onValueChange={handleTimeFrameChange}
          className="justify-start"
        >
          {(Object.keys(timeFrameLimits) as TimeFrame[]).map((tf) => (
            <ToggleGroupItem
              key={tf}
              value={tf}
              aria-label={getTimeFrameLabel(tf)}
              className="px-3 py-2"
            >
              {getTimeFrameLabel(tf)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                stroke="#888888"
              />
              <YAxis
                domain={['auto', 'auto']}
                stroke="#888888"
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '價格']}
                contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
              />
              <Scatter
                name="買點"
                data={priceData.filter(d => d.signal === 'buy')}
                dataKey="price"
                fill="#22c55e"
                shape="circle"
              />
              <Scatter
                name="賣點"
                data={priceData.filter(d => d.signal === 'sell')}
                dataKey="price"
                fill="#ef4444"
                shape="circle"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};