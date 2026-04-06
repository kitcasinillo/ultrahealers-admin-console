import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface BaseGaugeChartProps {
  title: string;
  data: { name: string; value: number }[];
  colors: string[];
  score: number | string;
  statusBadge?: { text: string; className: string };
  subtitle: React.ReactNode;
}

export function BaseGaugeChart({ title, data, colors, score, statusBadge, subtitle }: BaseGaugeChartProps) {
  return (
    <Card className="rounded-3xl border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:bg-[#111C44] min-w-0">
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">{title}</CardTitle>
        {statusBadge && (
          <div className={statusBadge.className}>
            {statusBadge.text}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-0">
        <div className="h-[200px] sm:h-[250px] w-full relative flex items-center justify-center -mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="70%"
                innerRadius="65%"
                outerRadius="85%"
                startAngle={180}
                endAngle={0}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 text-center">
            <span className="text-4xl sm:text-5xl font-extrabold text-[#1b254b] dark:text-white block leading-none">{score}</span>
            <span className="text-[#A3AED0] block text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">Score</span>
          </div>
        </div>
        <div className="text-center -mt-4 sm:-mt-8 mb-4">
          <p className="text-[#A3AED0] text-xs sm:text-sm font-medium">
            {subtitle}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
