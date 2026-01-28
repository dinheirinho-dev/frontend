"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import React from 'react';

const COLORS = ['#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#6A4C93', '#F78C6B', '#A8E6CF', '#DCEDC1', '#FFD3B6'];

interface ChartData {
    category: string;
    total_spent: number;
}

interface ExpensePieChartProps {
    data: ChartData[];
    totalExpense: number;
    showValues: boolean;
}

export default function ExpensePieChart({ data, totalExpense, showValues }: ExpensePieChartProps) {

    if (!data || data.length === 0 || totalExpense === 0) {
        return (
            <div className="flex items-center justify-center h-80 text-center p-8 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p>Nenhum gasto registrado ainda. Lance uma despesa para ver a mágica! ✨</p>
            </div>
        );
    }

    // Ordenar do maior para o menor para o gráfico ficar elegante
    const chartData = [...data]
        .sort((a, b) => b.total_spent - a.total_spent)
        .map(item => ({
            name: item.category,
            value: item.total_spent,
        }));

    return (
        <div className="h-full flex flex-col justify-center">
            <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={70} // Transforma em Donut
                            outerRadius={95}
                            paddingAngle={5} // Dá um respiro entre as fatias
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>

                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Gasto']}
                        />

                        {/* Legenda Lateral com Scroll se necessário */}
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{
                                paddingLeft: '20px',
                                fontSize: '12px',
                                lineHeight: '24px',
                                maxHeight: '250px',
                                overflowY: 'auto'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="text-center pb-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Total no Mês</p>
                <p className="text-xl font-bold text-gray-700">
                    {showValues
                        ? `R$ ${totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : "R$ ••••••"}
                </p>
            </div>
        </div>
    );
}