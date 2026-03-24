import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface BasePieChartProps {
  title: string;
  data: { name: string; value: number; color: string }[];
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}

export function BasePieChart({ 
  title, 
  data, 
  innerRadius = 60, 
  outerRadius = 80 
}: BasePieChartProps) {
  return (
    <Card className="rounded-3xl border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:bg-[#111C44] min-w-0">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
