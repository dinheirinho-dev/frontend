'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '../components/AppLayout';
import { TrendingUp } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function parseBRL(value: string): number {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
}

function formatBRL(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function maskBRL(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    const num = parseInt(digits, 10) / 100;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InvestimentosPage() {
    const [saldoInicial, setSaldoInicial] = useState('1.000,00');
    const [taxa, setTaxa] = useState('1');
    const [taxaTipo, setTaxaTipo] = useState<'am' | 'aa'>('am');
    const [aporte, setAporte] = useState('500,00');
    const [periodo, setPeriodo] = useState('12');
    const [periodoTipo, setPeriodoTipo] = useState<'meses' | 'anos'>('meses');

    const resultado = useMemo(() => {
        const principal = parseBRL(saldoInicial);
        const aporteVal = parseBRL(aporte);
        const taxaNum = parseFloat(taxa.replace(',', '.')) / 100;
        const meses = periodoTipo === 'anos' ? parseInt(periodo) * 12 : parseInt(periodo);
        const taxaMensal = taxaTipo === 'aa'
            ? Math.pow(1 + taxaNum, 1 / 12) - 1
            : taxaNum;

        if (!meses || taxaMensal < 0) return null;

        const pontos = [];
        let saldo = principal;
        let totalInvestido = principal;

        for (let i = 1; i <= meses; i++) {
            saldo = saldo * (1 + taxaMensal) + aporteVal;
            totalInvestido += aporteVal;
            if (i % (meses <= 24 ? 1 : meses <= 60 ? 3 : 6) === 0 || i === meses) {
                pontos.push({
                    mes: periodoTipo === 'anos' && meses > 24
                        ? `Ano ${Math.floor(i / 12) || 1}`
                        : `Mês ${i}`,
                    investido: Math.round(totalInvestido * 100) / 100,
                    juros: Math.round((saldo - totalInvestido) * 100) / 100,
                    total: Math.round(saldo * 100) / 100,
                });
            }
        }

        const juros = saldo - totalInvestido;
        const lucro = principal > 0 ? ((saldo - totalInvestido) / totalInvestido) * 100 : 0;

        return { totalFinal: saldo, totalInvestido, juros, lucro, pontos };
    }, [saldoInicial, taxa, taxaTipo, aporte, periodo, periodoTipo]);

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-6 transition-colors duration-200">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="pt-4 mb-6 px-2">
                        <h1 className="text-2xl font-extrabold text-green-700 dark:text-green-400 flex items-center gap-2"><TrendingUp className="w-6 h-6" /> Investimentos</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Simule o crescimento do seu patrimônio</p>
                    </div>

                    {/* Calculadora */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-4">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Calculadora de Juros Compostos</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Saldo Inicial */}
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Saldo Inicial</label>
                                <div className="flex items-center mt-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 gap-1">
                                    <span className="text-xs text-gray-400 font-bold">R$</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={saldoInicial}
                                        onChange={e => setSaldoInicial(maskBRL(e.target.value))}
                                        className="flex-1 bg-transparent text-sm font-bold text-gray-800 dark:text-gray-100 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Taxa de Juros */}
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Taxa de Juros</label>
                                <div className="flex items-center mt-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 gap-2">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={taxa}
                                        onChange={e => setTaxa(e.target.value)}
                                        className="w-16 bg-transparent text-sm font-bold text-gray-800 dark:text-gray-100 outline-none"
                                    />
                                    <span className="text-xs text-gray-400 font-bold">%</span>
                                    <div className="ml-auto flex bg-gray-200 dark:bg-gray-600 rounded-lg p-0.5 gap-0.5">
                                        {(['am', 'aa'] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTaxaTipo(t)}
                                                className={`text-[10px] font-black px-2 py-1 rounded-md transition-all ${taxaTipo === t ? 'bg-white dark:bg-gray-800 text-green-600 shadow' : 'text-gray-500 dark:text-gray-400'}`}
                                            >
                                                {t === 'am' ? 'a.m.' : 'a.a.'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Aporte Mensal */}
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Aporte Mensal</label>
                                <div className="flex items-center mt-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 gap-1">
                                    <span className="text-xs text-gray-400 font-bold">R$</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={aporte}
                                        onChange={e => setAporte(maskBRL(e.target.value))}
                                        className="flex-1 bg-transparent text-sm font-bold text-gray-800 dark:text-gray-100 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Período */}
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Período</label>
                                <div className="flex items-center mt-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={periodo}
                                        onChange={e => setPeriodo(e.target.value)}
                                        className="w-16 bg-transparent text-sm font-bold text-gray-800 dark:text-gray-100 outline-none"
                                    />
                                    <div className="ml-auto flex bg-gray-200 dark:bg-gray-600 rounded-lg p-0.5 gap-0.5">
                                        {(['meses', 'anos'] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setPeriodoTipo(t)}
                                                className={`text-[10px] font-black px-2 py-1 rounded-md transition-all ${periodoTipo === t ? 'bg-white dark:bg-gray-800 text-green-600 shadow' : 'text-gray-500 dark:text-gray-400'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resultados */}
                    {resultado && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                {[
                                    { label: 'Total Final', value: `R$ ${formatBRL(resultado.totalFinal)}`, color: 'text-green-600 dark:text-green-400' },
                                    { label: 'Total Investido', value: `R$ ${formatBRL(resultado.totalInvestido)}`, color: 'text-blue-600 dark:text-blue-400' },
                                    { label: 'Total em Juros', value: `R$ ${formatBRL(resultado.juros)}`, color: 'text-emerald-600 dark:text-emerald-400' },
                                    { label: 'Lucro %', value: `${resultado.lucro.toFixed(1)}%`, color: 'text-purple-600 dark:text-purple-400' },
                                ].map(card => (
                                    <div key={card.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
                                        <p className={`text-base font-black ${card.color}`}>{card.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Gráfico */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-4 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Evolução Patrimonial</p>
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={resultado.pontos} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gradInvestido" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradJuros" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={(v: number) => `R$ ${formatBRL(v)}`} />
                                        <Legend />
                                        <Area type="monotone" dataKey="investido" name="Investido" stroke="#3b82f6" fill="url(#gradInvestido)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="juros" name="Juros" stroke="#10b981" fill="url(#gradJuros)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}

                    {/* Aportes e Dividendos — Em Desenvolvimento */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Aportes e Dividendos</p>
                            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full">Em Desenvolvimento</span>
                        </div>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Registre seus aportes em ativos reais e acompanhe seus dividendos recebidos.</p>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
