import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import axios from "axios";

export const TradingAdvice = () => {
  const [rsi, setRsi] = useState<number | null>(null);
  const [showBuySignal, setShowBuySignal] = useState(false);

  const calculateRSI = (prices: number[], period: number = 14) => {
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? -change : 0);

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const fetchAndCalculateRSI = async () => {
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/klines",
        {
          params: {
            symbol: "BTCUSDT",
            interval: "1h",
            limit: 15
          }
        }
      );

      const prices = response.data.map((kline: any) => parseFloat(kline[4]));
      const currentRSI = calculateRSI(prices);
      setRsi(currentRSI);
      setShowBuySignal(currentRSI < 30);
      console.log("Current RSI:", currentRSI);
    } catch (error) {
      console.error("Error calculating RSI:", error);
    }
  };

  useEffect(() => {
    fetchAndCalculateRSI();
    const interval = setInterval(fetchAndCalculateRSI, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, []);

  const getTradingAdvice = (rsi: number | null) => {
    if (rsi === null) return "等待數據...";
    if (rsi < 30) return "市場可能超賣，考慮買入";
    if (rsi > 70) return "市場可能超買，考慮獲利了結";
    return "市場處於中性狀態";
  };

  const getAdviceColor = (rsi: number | null) => {
    if (rsi === null) return "text-gray-400";
    if (rsi < 30) return "text-green-500";
    if (rsi > 70) return "text-red-500";
    return "text-yellow-500";
  };

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <h2 className="text-xl font-semibold mb-4">交易建議</h2>
      {showBuySignal && (
        <Alert variant="destructive" className="mb-4 border-[#ea384c] bg-[#ea384c]/10">
          <AlertTitle className="text-[#ea384c]">
            買入信號！RSI 低於 30，可能是好的買入時機
          </AlertTitle>
        </Alert>
      )}
      <div className="space-y-4">
        <div>
          <p className="text-gray-400 mb-2">當前 RSI</p>
          <p className="text-2xl font-bold">
            {rsi ? rsi.toFixed(2) : "計算中..."}
          </p>
        </div>
        <div>
          <p className="text-gray-400 mb-2">建議</p>
          <p className={`text-xl font-semibold ${getAdviceColor(rsi)}`}>
            {getTradingAdvice(rsi)}
          </p>
        </div>
      </div>
    </Card>
  );
};