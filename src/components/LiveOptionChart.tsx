import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { OptionPremiumDataPoint } from "@/hooks/useLiveChartData";

interface LiveOptionChartProps {
  data: OptionPremiumDataPoint[];
  atmStrike: number;
  indexName: string;
}

export const LiveOptionChart = ({ data, atmStrike, indexName }: LiveOptionChartProps) => {
  // Only show chart if we have data
  if (!data || data.length === 0) {
    return (
      <Card className="p-3">
        <h2 className="text-base font-bold mb-3">Live Options Chart - {indexName} {atmStrike} Strike</h2>
        <div className="flex items-center justify-center h-[280px] text-muted-foreground">
          No data available - Market may be closed
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <h2 className="text-base font-bold mb-3">Live Options Chart - {indexName} {atmStrike} Strike</h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="callPremium" 
            stroke="hsl(var(--chart-call))" 
            name="Call Premium"
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="putPremium" 
            stroke="hsl(var(--chart-put))" 
            name="Put Premium"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
