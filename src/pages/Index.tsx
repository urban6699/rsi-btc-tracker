import { PriceTracker } from "@/components/PriceTracker";
import { RSIChart } from "@/components/RSIChart";
import { TradingAdvice } from "@/components/TradingAdvice";
import { MACDChart } from "@/components/MACDChart";
import { HistoricalPriceChart } from "@/components/HistoricalPriceChart";
import { KDChart } from "@/components/KDChart";
import { useState } from "react";

type TimeFrame = "15m" | "1h" | "4h" | "1d" | "1w" | "1M";

const Index = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("15m");

  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
    console.log(`Time frame changed to: ${newTimeFrame}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-8">BTC/USDT 交易分析</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <PriceTracker />
        <TradingAdvice timeFrame={timeFrame} />
        <div className="md:col-span-2">
          <HistoricalPriceChart onTimeFrameChange={handleTimeFrameChange} />
        </div>
        <div className="md:col-span-2">
          <RSIChart timeFrame={timeFrame} />
        </div>
        <div className="md:col-span-2">
          <MACDChart timeFrame={timeFrame} />
        </div>
        <div className="md:col-span-2">
          <KDChart timeFrame={timeFrame} />
        </div>
      </div>
    </div>
  );
};

export default Index;