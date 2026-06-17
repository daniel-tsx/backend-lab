'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const axisProps = {
  tick: { fill: 'var(--muted-foreground)', fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  contentStyle: {
    background: 'var(--popover)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: 12,
    color: 'var(--popover-foreground)',
  },
  labelStyle: { color: 'var(--muted-foreground)', marginBottom: 4 },
  cursor: { fill: 'var(--accent)', opacity: 0.3 },
} as const;

export function AreaTrend({
  data,
  xKey,
  dataKey,
  color = 'var(--chart-1)',
  height = 200,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  dataKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <XAxis dataKey={xKey} {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} width={36} allowDecimals={false} />
        <Tooltip {...tooltipStyle} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={color}
          fillOpacity={0.12}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LineTrend({
  data,
  xKey,
  dataKey,
  color = 'var(--chart-2)',
  height = 200,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  dataKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <XAxis dataKey={xKey} {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} width={36} domain={[0, 100]} />
        <Tooltip {...tooltipStyle} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={{ r: 2, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBars({
  data,
  categoryKey,
  valueKey,
  color = 'var(--chart-1)',
  height = 240,
}: {
  data: Record<string, unknown>[];
  categoryKey: string;
  valueKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 12, bottom: 4, left: 8 }}
      >
        <XAxis type="number" {...axisProps} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey={categoryKey}
          {...axisProps}
          width={120}
        />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={valueKey} fill={color} radius={[0, 4, 4, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StackedBars({
  data,
  categoryKey,
  keys,
  colors,
  height = 240,
}: {
  data: Record<string, unknown>[];
  categoryKey: string;
  keys: string[];
  colors: string[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 12, bottom: 4, left: 8 }}
      >
        <XAxis type="number" {...axisProps} allowDecimals={false} />
        <YAxis type="category" dataKey={categoryKey} {...axisProps} width={120} />
        <Tooltip {...tooltipStyle} />
        {keys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            fill={colors[i % colors.length]}
            radius={i === keys.length - 1 ? [0, 4, 4, 0] : 0}
            barSize={14}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({
  data,
  nameKey,
  valueKey,
  colors,
  height = 220,
}: {
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
  colors: string[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip {...tooltipStyle} />
        <Pie
          data={data}
          nameKey={nameKey}
          dataKey={valueKey}
          innerRadius={52}
          outerRadius={80}
          paddingAngle={2}
          stroke="var(--card)"
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RadarScore({
  data,
  max = 5,
  height = 280,
}: {
  data: { dimension: string; value: number }[];
  max?: number;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
        />
        <Radar
          dataKey="value"
          stroke="var(--chart-1)"
          fill="var(--chart-1)"
          fillOpacity={0.25}
          dot
        />
        <Tooltip {...tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];
