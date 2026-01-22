"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import React from 'react';

const COLORS = ['#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#6A4C93', '#F78C6B'];

// Interface for the data received from the backend summary
interface ChartData {
    category: string;
    total_spent: number;
}

// Our isolated component follows the Single Responsibility Principle (SRP)
interface ExpensePieChartProps {
    data: ChartData[];
    totalExpense: number;
}

const RADIAN = Math.PI / 180;

// Custom Label: Ensures the chart label are outside the slices
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.cos(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-sm font-semibold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

export default function ExpensePieChart({ data, totalExpense }: ExpensePieChartProps) {

    // Check if there are expenses to display
    if (!data || data.length === 0 || totalExpense === 0) {
        return (
            <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-md">
                <p>Nenhum gasto para colocar no gráfico ainda. Continue organizando suas despesas!</p>
            </div>
        );
    }

    // Map the backend data to Recharts format
    const chartData = data.map(item => ({
        name: item.category,
        value: item.total_spent,
    }));


    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-96">
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="98%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            labelLine={false}
                            label={renderCustomizedLabel}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>

                        {/* Tooltip shows details when the user hovers over a slice */}
                        <Tooltip
                            formatter={(value: number, name: string) => [`R$ ${value.toFixed(2)}`, name]}
                        />

                        {/* Legend explains what each color/slice represents */}
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}