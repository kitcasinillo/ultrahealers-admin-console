import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export interface AreaConfig {
  name: string;
  dataKey: string;
  stroke: string;
  fillOpacity?: number;
}

interface BaseAreaChartProps {
  title: string;
  data: any[];
  areas: AreaConfig[];
  yAxisTickFormatter?: (value: any) => string;
}

export function BaseAreaChart({ title, data, areas, yAxisTickFormatter }: BaseAreaChartProps) {
  return (
    <Card className="rounded-3xl border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:bg-[#111C44] min-w-0">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {areas.map((a, idx) => (
                  <linearGradient key={idx} id={`color${a.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={a.stroke} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={a.stroke} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
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
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
              {areas.map((a, idx) => (
                <Area 
                  key={idx}
                  name={a.name}
                  type="monotone" 
                  dataKey={a.dataKey} 
                  stackId="1" 
                  stroke={a.stroke} 
                  fillOpacity={a.fillOpacity ?? 1} 
                  fill={`url(#color${a.dataKey})`} 
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
