"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ShoppingList } from "@/lib/types";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/contexts/I18nContext";

interface ItemsPerListChartProps {
  lists: ShoppingList[];
}

export default function ItemsPerListChart({ lists }: ItemsPerListChartProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  const isDark = theme === "dark";
  const textColor = isDark ? "#ededed" : "#171717";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const barColor = isDark ? "#3b82f6" : "#2563eb";

  // Fetch item counts for each list
  const data = lists.map((list) => ({
    name: list.name.length > 15 ? list.name.substring(0, 15) + "..." : list.name,
    fullName: list.name,
    items: list.items?.length || 0,
  }));

  if (lists.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        {t("overview.noLists")}
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: textColor, fontSize: 12 }}
          />
          <YAxis tick={{ fill: textColor, fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              borderRadius: "8px",
              color: textColor,
            }}
            formatter={(value: number) => [value, t("overview.itemsCount")]}
            labelFormatter={(label) => {
              const item = data.find((d) => d.name === label || d.name.startsWith(label));
              return item?.fullName || label;
            }}
          />
          <Legend
            wrapperStyle={{ color: textColor }}
            formatter={() => t("overview.itemsCount")}
          />
          <Bar dataKey="items" fill={barColor} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

