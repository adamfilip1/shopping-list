"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ShoppingListItem } from "@/lib/types";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/contexts/I18nContext";

interface ItemsStatusChartProps {
  items: ShoppingListItem[];
}

export default function ItemsStatusChart({ items }: ItemsStatusChartProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  const resolvedCount = items.filter((item) => item.state === "done").length;
  const unresolvedCount = items.filter((item) => item.state === "open").length;

  const data = [
    { name: t("stats.resolved"), value: resolvedCount },
    { name: t("stats.unresolved"), value: unresolvedCount },
  ];

  const isDark = theme === "dark";
  const textColor = isDark ? "#ededed" : "#171717";
  const COLORS = isDark
    ? ["#10b981", "#f59e0b"] // green-500, amber-500 for dark
    : ["#059669", "#d97706"]; // green-600, amber-600 for light

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        {t("items.noItems")}
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              borderRadius: "8px",
              color: textColor,
            }}
          />
          <Legend
            wrapperStyle={{ color: textColor }}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

