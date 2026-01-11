import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IVDataPoint } from "@/hooks/useLiveChartData";

interface IVChartProps {
  data: IVDataPoint[];
  atmStrike: number;
  currentPrice: number;
}

export const IVChart = ({ data, atmStrike, currentPrice }: IVChartProps) => {
  // Only show chart if we have data
  if (!data || data.length === 0) {
    return (
      <Card className="p-3">
        <h2 className="text-base font-bold mb-3">Implied Volatility Smile - ATM {atmStrike}</h2>
        <div className="flex items-center justify-center h-[280px] text-muted-foreground">
          No data available - Market may be closed
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <h2 className="text-base font-bold mb-3">Implied Volatility Smile - ATM {atmStrike}</h2>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="strike" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            label={{ value: 'IV %', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="callIV" 
            stroke="hsl(var(--chart-call))" 
            fill="hsl(var(--chart-call))"
            fillOpacity={0.3}
            name="Call IV"
          />
          <Area 
            type="monotone" 
            dataKey="putIV" 
            stroke="hsl(var(--chart-put))" 
            fill="hsl(var(--chart-put))"
            fillOpacity={0.3}
            name="Put IV"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
