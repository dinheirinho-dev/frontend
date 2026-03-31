"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth, useUser } from "@clerk/nextjs";
import api from '../../src/services/api';
import { FinancialSummary, Goal } from '../../src/types';
import { formatMoney, maskedValue } from '../../src/utils/formatMoney';
import { AppLayout } from '../components/AppLayout';
import { usePro } from '../../src/hooks/usePro';
import PricingModal from '../components/PricingModal';
import { Eye, EyeOff, TrendingUp, Lightbulb, AlertTriangle, BarChart2 } from 'lucide-react';

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function getDelta(current: number, previous: number) {
    if (!previous || previous === 0) return null;
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    return { pct: Math.abs(pct), up: pct >= 0 };
}

export default function RelatorioPage() {
    const { userId, isLoaded } = useAuth();
    const { user } = useUser();
    const { isPro } = usePro();
    const [showPricingModal, setShowPricingModal] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showValues, setShowValues] = useState(true);

    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [prevSummary, setPrevSummary] = useState<FinancialSummary | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const getHeaders = useCallback(() => ({
        'x-clerk-id': userId ?? '',
        'x-clerk-email': user?.primaryEmailAddress?.emailAddress ?? '',
    }), [userId, user]);

    const getPrevMonthYear = useCallback(() => {
        if (selectedMonth === 1) return { month: 12, year: selectedYear - 1 };
        return { month: selectedMonth - 1, year: selectedYear };
    }, [selectedMonth, selectedYear]);

    const fetchData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setFetchError(null);
        try {
            const headers = getHeaders();
            const prev = getPrevMonthYear();
            const [sumRes, prevRes, goalsRes] = await Promise.all([
                api.get(`/summary/?month=${selectedMonth}&year=${selectedYear}`, { headers }),
                api.get(`/summary/?month=${prev.month}&year=${prev.year}`, { headers }),
                api.get('/goals/', { headers }),
            ]);
            setSummary(sumRes.data);
            setPrevSummary(prevRes.data);
            setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : []);
        } catch {
            setFetchError('Não foi possível carregar os dados.');
        } finally {
            setLoading(false);
        }
    }, [userId, selectedMonth, selectedYear, getHeaders, getPrevMonthYear]);

    useEffect(() => {
        if (isLoaded && userId) fetchData();
    }, [isLoaded, userId, fetchData]);

    if (!isLoaded || (loading && !summary)) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-screen text-green-700 font-bold animate-pulse">
                    Carregando Relatório...
                </div>
            </AppLayout>
        );
    }

    const savingsRate = summary && summary.total_revenue > 0
        ? ((summary.total_revenue - summary.total_expense) / summary.total_revenue) * 100
        : 0;

    const topExpenses = [...(summary?.expense_by_category ?? [])]
        .sort((a, b) => b.total_spent - a.total_spent)
        .slice(0, 5);

    const revenueDelta = getDelta(summary?.total_revenue ?? 0, prevSummary?.total_revenue ?? 0);
    const expenseDelta = getDelta(summary?.total_expense ?? 0, prevSummary?.total_expense ?? 0);
    const balanceDelta = getDelta(
        (summary?.total_revenue ?? 0) - (summary?.total_expense ?? 0),
        (prevSummary?.total_revenue ?? 0) - (prevSummary?.total_expense ?? 0)
    );

    const activeGoals = goals.filter(g => g.status === 'ATIVA');

    return (
        <AppLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 p-2 md:p-4">
            <div className="container mx-auto max-w-5xl">

                {/* Header */}
                <div className="flex items-center justify-between pt-4 mb-6 px-2">
                    <div>
                        <h1 className="text-xl md:text-2xl font-extrabold text-green-700 dark:text-green-400 flex items-center gap-2">
                            <BarChart2 className="w-6 h-6" /> Relatório Mensal
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Conta de {user?.firstName}</p>
                    </div>
                    <button
                        onClick={() => setShowValues(!showValues)}
                        className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-lg shadow-sm text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    >
                        {showValues ? <><EyeOff className="w-3.5 h-3.5" /> Ocultar</> : <><Eye className="w-3.5 h-3.5" /> Mostrar</>}
                    </button>
                </div>

                {/* Seletor de Mês */}
                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 w-fit mb-6 mx-2 shadow-sm">
                    <button
                        onClick={() => {
                            if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
                            else setSelectedMonth(m => m - 1);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 font-bold text-lg"
                    >
                        ‹
                    </button>
                    <div className="flex items-center gap-1 px-2">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-transparent text-gray-800 dark:text-gray-100 text-sm font-bold outline-none cursor-pointer"
                        >
                            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                        </select>
                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-14 bg-transparent text-gray-500 dark:text-gray-400 text-sm font-bold outline-none text-center"
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
                            else setSelectedMonth(m => m + 1);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 font-bold text-lg"
                    >
                        ›
                    </button>
                </div>

                {fetchError && (
                    <div className="mx-2 mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">
                        {fetchError}
                    </div>
                )}

                {/* Grid principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">

                    {/* Taxa de Poupança */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Taxa de Poupança</p>
                        <div className="flex items-end gap-3 mb-4">
                            <span className={`text-4xl font-black ${savingsRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {showValues ? `${savingsRate.toFixed(1)}%` : '***'}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">das receitas poupadas</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${savingsRate >= 20 ? 'bg-green-500' : savingsRate >= 0 ? 'bg-yellow-400' : 'bg-red-500'}`}
                                style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                            {savingsRate >= 20
                                ? <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 shrink-0" /> Ótima taxa! Continue assim.</span>
                                : savingsRate >= 0
                                    ? <span className="flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5 shrink-0" /> Tente poupar ao menos 20%.</span>
                                    : <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Gastos acima das receitas.</span>
                            }
                        </p>
                    </div>

                    {/* Comparação Mês a Mês */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 overflow-hidden">
                        {!isPro && (
                            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-black/40 rounded-2xl flex flex-col items-center justify-center gap-3 px-4 text-center">
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-white text-xs font-bold leading-snug">Comparação mês a mês</p>
                                <button
                                    onClick={() => setShowPricingModal(true)}
                                    className="text-[11px] font-black bg-white text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
                                >
                                    Desbloqueie análises profundas com o PRO
                                </button>
                            </div>
                        )}
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                            vs. {MONTHS[getPrevMonthYear().month - 1]}
                        </p>
                        <div className="space-y-3">
                            {/* Receitas */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase">Receitas</p>
                                    <p className="text-base font-black text-gray-800 dark:text-gray-100">{maskedValue(summary?.total_revenue ?? 0, showValues)}</p>
                                </div>
                                {revenueDelta && (
                                    <div className={`text-right px-2.5 py-1.5 rounded-xl ${revenueDelta.up ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                                        <p className={`text-xs font-black ${revenueDelta.up ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {revenueDelta.up ? '▲' : '▼'} {revenueDelta.pct.toFixed(1)}%
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{maskedValue(prevSummary?.total_revenue ?? 0, showValues)}</p>
                                    </div>
                                )}
                            </div>
                            {/* Gastos */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">Gastos</p>
                                    <p className="text-base font-black text-gray-800 dark:text-gray-100">{maskedValue(summary?.total_expense ?? 0, showValues)}</p>
                                </div>
                                {expenseDelta && (
                                    <div className={`text-right px-2.5 py-1.5 rounded-xl ${!expenseDelta.up ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                                        <p className={`text-xs font-black ${!expenseDelta.up ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {expenseDelta.up ? '▲' : '▼'} {expenseDelta.pct.toFixed(1)}%
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{maskedValue(prevSummary?.total_expense ?? 0, showValues)}</p>
                                    </div>
                                )}
                            </div>
                            {/* Saldo do Mês */}
                            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                                <div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Saldo do Mês</p>
                                    <p className={`text-base font-black ${((summary?.total_revenue ?? 0) - (summary?.total_expense ?? 0)) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {maskedValue((summary?.total_revenue ?? 0) - (summary?.total_expense ?? 0), showValues)}
                                    </p>
                                </div>
                                {balanceDelta && (
                                    <div className={`text-right px-2.5 py-1.5 rounded-xl ${balanceDelta.up ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                                        <p className={`text-xs font-black ${balanceDelta.up ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {balanceDelta.up ? '▲' : '▼'} {balanceDelta.pct.toFixed(1)}%
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                            {maskedValue((prevSummary?.total_revenue ?? 0) - (prevSummary?.total_expense ?? 0), showValues)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top 5 Categorias de Gasto */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 md:col-span-2 overflow-hidden">
                        {!isPro && (
                            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-black/40 rounded-2xl flex flex-col items-center justify-center gap-3 px-4 text-center">
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-white text-xs font-bold leading-snug">Top 5 categorias de gasto</p>
                                <button
                                    onClick={() => setShowPricingModal(true)}
                                    className="text-[11px] font-black bg-white text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
                                >
                                    Desbloqueie análises profundas com o PRO
                                </button>
                            </div>
                        )}
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Top 5 Categorias de Gasto</p>
                        {topExpenses.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Nenhum gasto registrado neste mês.</p>
                        ) : (
                            <div className="space-y-3">
                                {topExpenses.map((cat, i) => {
                                    const pct = summary?.total_expense ? (cat.total_spent / summary.total_expense) * 100 : 0;
                                    const COLORS = ['#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#6A4C93'];
                                    return (
                                        <div key={cat.category}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-4">{i + 1}</span>
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{cat.category}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[11px] text-gray-400 dark:text-gray-500">{pct.toFixed(1)}%</span>
                                                    <span className="text-sm font-black text-gray-800 dark:text-gray-100">{maskedValue(cat.total_spent, showValues)}</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%`, backgroundColor: COLORS[i] }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Progresso das Metas */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 md:col-span-2">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Metas em Andamento</p>
                        {activeGoals.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Nenhuma meta ativa.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {activeGoals.map(goal => {
                                    const pct = Math.min((goal.valor_atual / goal.valor_alvo) * 100, 100);
                                    const restante = goal.valor_alvo - goal.valor_atual;
                                    const deadline = new Date(goal.data_limite);
                                    const today = new Date();
                                    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <div key={goal.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-start justify-between mb-2">
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">{goal.descricao}</p>
                                                <span className="text-base font-black text-green-600 dark:text-green-400 ml-2 shrink-0">{pct.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-2">
                                                <div className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
                                                <span>{maskedValue(goal.valor_atual, showValues)} / {maskedValue(goal.valor_alvo, showValues)}</span>
                                                <span className={daysLeft < 30 ? 'text-orange-500 dark:text-orange-400 font-bold' : ''}>
                                                    {daysLeft > 0 ? `${daysLeft}d restantes` : 'Prazo encerrado'}
                                                </span>
                                            </div>
                                            {restante > 0 && (
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                                    Faltam {maskedValue(restante, showValues)}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-8 text-xs text-gray-300 dark:text-gray-600">
                    Dinheirinho · {MONTHS[selectedMonth - 1]} {selectedYear}
                </div>
            </div>
        </div>
        <PricingModal
            isOpen={showPricingModal}
            onClose={() => setShowPricingModal(false)}
        />
        </AppLayout>
    );
}
