"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type BalancePoint = {
    date: string;
    balance: number;
};

const formatMoney = (value: number, includeCurrency = true): string => {
    const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(value);
    return includeCurrency ? formatted : formatted.replace('R$', '').trim();
};
interface BalanceChartProps {
    data: BalancePoint[];
}

const CustomTooltip: React.FC<{ active?: boolean, payload?: any[], label?: string }> = ({ active, payload, label }) => {
    if (active && payload && payload.length && label) {
        const [year, month, day] = label.split('-');
        const d = new Date(Number(year), Number(month) - 1, Number(day));

        return (
            <div className="p-4 bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl text-sm">
                <p className="font-bold text-gray-400 mb-1">
                    {d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                </p>
                <p className="text-xl font-black text-green-600">
                    {formatMoney(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

const BalanceChart: React.FC<BalanceChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-80 text-center p-8 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p>🚀 Lance algumas transações para ver a evolução da sua pilha!</p>
            </div>
        );
    }

    return (
        <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    {/* Grid apenas horizontal e bem sutil */}
                    <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="3 3" />

                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        minTickGap={30}
                        tickFormatter={(tick) => {
                            if (!tick) return "";
                            // O tick vem como "2026-02-02"
                            const [year, month, day] = tick.split('-');
                            return `${day}/${month}`; // Retorna "02/02" sem erro de fuso
                        }}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        tickFormatter={(tick) => `R$ ${tick}`}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '5 5' }} />

                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BalanceChart;