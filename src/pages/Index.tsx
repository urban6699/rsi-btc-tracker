import { PriceTracker } from "@/components/PriceTracker";
import { RSIChart } from "@/components/RSIChart";
import { TradingAdvice } from "@/components/TradingAdvice";
import { MACDChart } from "@/components/MACDChart";
import { HistoricalPriceChart } from "@/components/HistoricalPriceChart";
import { KDChart } from "@/components/KDChart";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-8">BTC/USDT 交易分析</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <PriceTracker />
        <TradingAdvice />
        <div className="md:col-span-2">
          <HistoricalPriceChart />
        </div>
        <div className="md:col-span-2">
          <RSIChart />
        </div>
        <div className="md:col-span-2">
          <MACDChart />
        </div>
        <div className="md:col-span-2">
          <KDChart />
        </div>
      </div>
    </div>
  );
};

export default Index;