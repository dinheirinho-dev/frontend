"use client";

import React, { useRef, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BalancePoint } from '../../src/types';
import { formatMoney } from '../../src/utils/formatMoney';

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
                <p className={`text-xl font-black ${payload[0].value < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {formatMoney(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

function buildTicks(data: BalancePoint[]): string[] {
    if (data.length <= 4) return data.map(p => p.date);
    const last = data.length - 1;
    const step = last / 3; // 3 intervalos = 4 pontos
    return [0, 1, 2, 3].map(i => data[Math.round(i * step)].date);
}

const BalanceChart: React.FC<BalanceChartProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState<number>(0);
    const [chartHeight, setChartHeight] = useState<number>(220);

    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                setChartWidth(containerRef.current.offsetWidth);
                const h = containerRef.current.offsetHeight;
                if (h > 0) setChartHeight(Math.min(h, 320));
            }
        };
        measure();
        const observer = new ResizeObserver(measure);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    if (!data || data.length === 0) {
        return (
            <div
                className="flex items-center justify-center text-center p-8 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600"
                style={{ height: '100%', minHeight: '220px' }}
            >
                <p>🚀 Lance algumas transações para ver a evolução da sua pilha!</p>
            </div>
        );
    }

    const ticks = buildTicks(data);
    const currentBalance = data[data.length - 1]?.balance ?? 0;
    const color = currentBalance < 0 ? '#ef4444' : '#10b981';

    return (
        <div ref={containerRef} className="w-full mt-4 overflow-hidden" style={{ height: '100%', minHeight: '220px', maxHeight: '320px' }}>
            {chartWidth > 0 && (
                <AreaChart
                    width={chartWidth}
                    height={chartHeight}
                    data={data}
                    margin={{ top: 5, right: 15, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="3 3" />

                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 9 }}
                        ticks={ticks}
                        tickFormatter={(tick) => {
                            if (!tick) return "";
                            const [, month, day] = tick.split('-');
                            return `${day}/${month}`;
                        }}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 9 }}
                        width={55}
                        tickFormatter={(tick) => {
                            const abs = Math.abs(tick);
                            return abs >= 1000
                                ? `${tick < 0 ? '-' : ''}R$${(abs / 1000).toFixed(1)}k`
                                : `R$${tick}`;
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '5 5' }} />

                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                        isAnimationActive={false}
                        animationDuration={0}
                    />
                </AreaChart>
            )}
        </div>
    );
};

export default BalanceChart;
