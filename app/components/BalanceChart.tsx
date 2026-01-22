// components/BalanceChart.tsx

"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 1. SOLUÇÃO: Define o tipo BalancePoint AQUI
type BalancePoint = {
    date: string;
    balance: number;
};

// 2. SOLUÇÃO: Função de Formatação (Substitui utils/formatters)
const formatMoney = (value: number, includeCurrency = true): string => {
    const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(Math.abs(value)); // Usa Math.abs para formatar o número sem o sinal

    return includeCurrency ? formatted : formatted.replace('R$', '').trim();
};


interface BalanceChartProps {
    data: BalancePoint[];
}

// 3. SOLUÇÃO: CustomTooltip com tipagem explícita
const CustomTooltip: React.FC<{ active?: boolean, payload?: any[], label?: string }> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-md text-sm">
                <p className="font-semibold text-gray-700">{label}</p>
                <p className="text-lg font-black" style={{ color: payload[0].color }}>
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
            <div className="text-center p-8 text-gray-500 bg-white rounded-lg shadow-md">
                <p>🚀 Lance algumas transações para ver seu histórico de saldo aqui!</p>
            </div>
        );
    }

    // Mapeia os dados para o formato que o Recharts usa, garantindo o sinal (positivo/negativo)
    const chartData = data.map(item => ({
        ...item,
        // Garante que os valores no eixo Y sejam plotados corretamente (podem ser negativos)
        balance: item.balance,
    }));


    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-96">
            <ResponsiveContainer width="100%" height="98%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        fontSize={12}
                        stroke="#555"
                        // CORREÇÃO: Formatar a string YYYY-MM-DD HH:MM para exibição
                        tickFormatter={(tick) => {
                            const date = new Date(tick);
                            // Exibe Apenas a data (dia/mês)
                            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                        }}
                    />
                    <YAxis
                        // Formata o tick do eixo Y com R$
                        tickFormatter={(tick) => formatMoney(tick, true)}
                        fontSize={12}
                        stroke="#555"
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Definição do Gradiente de Fundo (Efeito visual Duolingo) */}
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            {/* Usa cores dinâmicas baseadas no Saldo */}
                            <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>

                    {/* Linha e Área do Saldo */}
                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#4CAF50" // Cor principal do Dinheirinho (Verde)
                        fill="url(#colorBalance)"
                        strokeWidth={2}
                        name="Saldo Acumulado"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BalanceChart;