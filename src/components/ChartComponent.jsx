import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#A3CEF1",
  "#F6BD60",
  "#84A59D",
  "#F28482",
  "#6A994E",
  "#FFC3A0",
  "#6B4226",
  "#FFE156",
  "#8E9AAF",
  "#B5EAEA",
];

const DIMMED_COLOR = "#d3d3d3";
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="14px"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ChartComponent = ({
  chartType,
  data,
  handleLegendClick,
  selectedLegend,
}) => {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={700}>
      {chartType === "pie" ? (
        <PieChart margin={{ bottom: 60 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={90}
            outerRadius={250}
            fill="#8884d8"
            paddingAngle={1}
            labelLine={false}
            label={renderCustomizedLabel}
            stroke="none"
            activeShape={null}
            onClick={(entry) =>
              handleLegendClick &&
              handleLegendClick({ name: entry.payload.name })
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  selectedLegend && entry.name !== selectedLegend
                    ? DIMMED_COLOR
                    : COLORS[index % COLORS.length]
                }
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ marginTop: 40 }}
            onClick={(entry) =>
              handleLegendClick &&
              handleLegendClick({ name: entry.payload.name })
            }
          />
        </PieChart>
      ) : (
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 95 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
          <YAxis />
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ marginTop: 40 }}
            onClick={(entry) =>
              handleLegendClick &&
              handleLegendClick({ name: entry.payload.name })
            }
          />
          <Bar
            dataKey="value"
            stroke="none"
            activeBar={null}
            isAnimationActive={false}
            onClick={(entry) =>
              handleLegendClick &&
              handleLegendClick({ name: entry.payload.name })
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  selectedLegend && entry.name !== selectedLegend
                    ? DIMMED_COLOR
                    : COLORS[index % COLORS.length]
                }
              />
            ))}
          </Bar>
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};

export default ChartComponent;
