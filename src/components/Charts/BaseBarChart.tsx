import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export interface BarConfig {
  name: string;
  dataKey: string;
  fill: string;
  stackId?: string;
  radius?: number | [number, number, number, number];
}

interface BaseBarChartProps {
  title: string;
  data: any[];
  bars: BarConfig[];
  yAxisTickFormatter?: (value: any) => string;
  className?: string;
}

export function BaseBarChart({ title, data, bars, yAxisTickFormatter, className }: BaseBarChartProps) {
  return (
    <Card className={`rounded-3xl border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:bg-[#111C44] min-w-0 h-full flex flex-col ${className || ""}`}>
      <CardHeader className="shrink-0">
        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[250px] sm:h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A3AED0', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A3AED0', fontSize: 12 }}
                tickFormatter={yAxisTickFormatter}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                cursor={{ fill: '#F4F7FE' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
              {bars.map((b, idx) => (
                <Bar 
                  key={idx}
                  name={b.name} 
                  dataKey={b.dataKey} 
                  stackId={b.stackId} 
                  fill={b.fill} 
                  radius={b.radius as any} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
