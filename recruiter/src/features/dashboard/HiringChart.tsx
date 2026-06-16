import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const chartConfig = {
  applications: {
    label: "Applications",
    color: "hsl(168 45% 38%)",
  },
  jobs: {
    label: "Jobs posted",
    color: "hsl(220 55% 42%)",
  },
} satisfies ChartConfig;

export default function HiringChart({
  data,
}: {
  data: { week: string; jobs: number; applications: number }[];
}) {
  const chartData = data.length ? data : [{ week: "—", jobs: 0, applications: 0 }];
  const totalApps = chartData.reduce((s, d) => s + d.applications, 0);
  const totalJobs = chartData.reduce((s, d) => s + d.jobs, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-6">
          <LegendSwatch color={chartConfig.applications.color!} label="Applications" value={totalApps} />
          <LegendSwatch color={chartConfig.jobs.color!} label="Jobs posted" value={totalJobs} />
        </div>
        <p className="text-[11px] text-muted-foreground">Last 8 weeks</p>
      </div>

      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
            barCategoryGap="20%"
          >
            <defs>
              <linearGradient id="fillApps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(168 45% 38%)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(168 45% 38%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-border/60" />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={28}
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted) / 0.25)" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `Week of ${label}`}
                  formatter={(value, name) => [
                    value ?? 0,
                    name === "applications" ? "Applications" : "Jobs posted",
                  ]}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="applications"
              name="applications"
              stroke="hsl(168 45% 38%)"
              strokeWidth={2}
              fill="url(#fillApps)"
            />
            <Bar
              dataKey="jobs"
              name="jobs"
              fill="hsl(220 55% 42%)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
              opacity={0.9}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

function LegendSwatch({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <div>
        <p className="text-[11px] font-medium text-foreground">{label}</p>
        <p className="font-display text-lg font-semibold leading-none tracking-tight">{value}</p>
      </div>
    </div>
  );
}

