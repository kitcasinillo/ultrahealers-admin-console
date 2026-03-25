import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface BaseHorizontalBarChartProps {
  title: string;
  data: any[];
  dataKey: string;
  nameKey: string;
  fill: string;
  yAxisWidth?: number;
  className?: string;
}

export function BaseHorizontalBarChart({ 
  title, 
  data, 
  dataKey, 
  nameKey, 
  fill, 
  yAxisWidth = 120,
  className
}: BaseHorizontalBarChartProps) {
  return (
    <Card className={`rounded-3xl border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:bg-[#111C44] min-w-0 h-full flex flex-col ${className || ""}`}>
      <CardHeader className="shrink-0">
        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[400px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey={nameKey} 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                width={yAxisWidth} 
                style={{ fontSize: '12px', fill: '#A3AED0' }} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                cursor={{ fill: '#F4F7FE' }}
              />
              <Bar 
                dataKey={dataKey} 
                fill={fill} 
                radius={[0, 4, 4, 0]} 
                barSize={15} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
