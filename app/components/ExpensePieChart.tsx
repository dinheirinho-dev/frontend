"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import React, { useMemo } from 'react';
import { CategorySummary } from '../../src/types';
import { formatMoney, maskedValue } from '../../src/utils/formatMoney';

const COLORS = ['#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#6A4C93', '#F78C6B', '#A8E6CF', '#DCEDC1', '#FFD3B6'];

interface ExpensePieChartProps {
    data: CategorySummary[];
    totalExpense: number;
    showValues: boolean;
}


export default function ExpensePieChart({ data, totalExpense, showValues }: ExpensePieChartProps) {

    const chartData = useMemo(
        () => [...data]
            .sort((a, b) => b.total_spent - a.total_spent)
            .map((item, i) => ({ name: item.category, value: item.total_spent, fill: COLORS[i % COLORS.length] })),
        [data]
    );

    const CustomTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({ active, payload }) => {
        if (!active || !payload?.length) return null;
        const { name, value, fill } = payload[0].payload;
        return (
            <div style={{ background: '#fff', borderLeft: `5px solid ${fill}`, borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', overflow: 'hidden', minWidth: '130px' }}>
                <div style={{ padding: '8px 12px 4px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{name}</p>
                </div>
                <div style={{ padding: '0 12px 10px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 900, color: fill }}>{formatMoney(value)}</p>
                </div>
            </div>
        );
    };

    if (!data || data.length === 0 || totalExpense === 0) {
        return (
            <div className="flex items-center justify-center h-80 text-center p-8 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                <p>Nenhum gasto registrado ainda. Lance uma despesa para ver a mágica! ✨</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="h-[200px] md:h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={4}
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>

                        <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none', border: 'none', background: 'transparent', padding: 0 }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legenda em grid — não estoura */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-1 pb-3">
                {chartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[index % COLORS.length] }} />
                        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{entry.name}</span>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 pb-2 text-center">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest mb-0.5">Total no Mês</p>
                <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
                    {maskedValue(totalExpense, showValues)}
                </p>
            </div>
        </div>
    );
}