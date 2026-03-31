"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import api from '../../src/services/api';
import { Transaction, Goal, FinancialSummary, BalancePoint } from '../../src/types';
import { maskedValue, formatMoney } from '../../src/utils/formatMoney';
import { AppLayout } from '../components/AppLayout';
import { usePro } from '../../src/hooks/usePro';
import PricingModal from '../components/PricingModal';
import { Eye, EyeOff, CheckCircle2, Crown, RefreshCw, Pencil, Trash2, Plus } from 'lucide-react';

import ConfirmModal from '../components/ConfirmModal';
import GoalCard from '../components/GoalCard';
import ExpensePieChart from '../components/ExpensePieChart';
import GoalForm from '../components/GoalForm';
import TransactionForm from '../components/TransactionForm';
import GoalProgressForm from '../components/GoalProgressForm';
import BalanceChart from '../components/BalanceChart';
import WelcomeModal from '../components/WelcomeModal';

const TRANSACTIONS_PER_PAGE = 10;

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CATEGORIES = [
    'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Educação',
    'Saúde', 'Salário', 'Investimento', 'Metas', 'Outros'
];

function getDelta(current: number, previous: number): { pct: number; up: boolean } | null {
    if (!previous || previous === 0) return null;
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    return { pct: Math.abs(pct), up: pct >= 0 };
}

export default function DashboardPage() {
    const { userId, isLoaded } = useAuth();
    const { user } = useUser();
    const { isPro } = usePro();
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [prevSummary, setPrevSummary] = useState<FinancialSummary | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [balanceHistory, setBalanceHistory] = useState<BalancePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [showValues, setShowValues] = useState(true);

    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [showProgressForm, setShowProgressForm] = useState(false);
    const [progressGoalId, setProgressGoalId] = useState<string | null>(null);
    const [progressGoalDescription, setProgressGoalDescription] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [showWelcome, setShowWelcome] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    // Filtros e paginação
    const [search, setSearch] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Recorrentes
    const [applyingRecurrent, setApplyingRecurrent] = useState(false);
    const [recurrentApplied, setRecurrentApplied] = useState<number | null>(null);

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
        setRecurrentApplied(null);

        try {
            const headers = getHeaders();
            const queryParams = `?month=${selectedMonth}&year=${selectedYear}`;
            const prev = getPrevMonthYear();
            const prevParams = `?month=${prev.month}&year=${prev.year}`;

            const [summaryRes, transRes, goalsRes, historyRes, prevSummaryRes] = await Promise.all([
                api.get(`/summary/${queryParams}`, { headers }),
                api.get(`/transactions/${queryParams}`, { headers }),
                api.get('/goals/', { headers }),
                api.get(`/balance_history/${queryParams}`, { headers }),
                api.get(`/summary/${prevParams}`, { headers }),
            ]);

            setSummary(summaryRes.data);
            setPrevSummary(prevSummaryRes.data);
            setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
            setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : []);
            setBalanceHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
            setCurrentPage(1);
        } catch {
            setFetchError('Não foi possível carregar os dados. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, [userId, selectedMonth, selectedYear, getHeaders, getPrevMonthYear]);

    useEffect(() => {
        if (isLoaded && userId) {
            fetchData();
        }
    }, [isLoaded, userId, fetchData]);

    useEffect(() => {
        if (isLoaded && userId && !loading) {
            const hasSeenWelcome = localStorage.getItem(`welcome_seen_${userId}`);
            const isCurrentMonth = selectedMonth === new Date().getMonth() + 1;
            if (!hasSeenWelcome && transactions.length === 0 && isCurrentMonth) {
                setShowWelcome(true);
            }
        }
    }, [isLoaded, userId, loading, transactions.length, selectedMonth]);

    // Verifica se há recorrentes do mês anterior não aplicados ainda
    const hasRecurrentPending = useMemo(() => {
        // Há lançamentos com recorrente=true nas transações carregadas?
        // Mas o que importa é saber se há do mês ANTERIOR para aplicar
        // Usamos como proxy: se o mês atual ainda não tem os recorrentes,
        // verificamos se o mês anterior tinha algum. Aqui simplificamos
        // mostrando o banner apenas se as transactions do mês atual não têm nenhum recorrente
        // e o prevSummary existe.
        return prevSummary !== null && recurrentApplied === null;
    }, [prevSummary, recurrentApplied]);

    const handleApplyRecurrent = async () => {
        if (!userId) return;
        setApplyingRecurrent(true);
        try {
            const res = await api.post(
                `/transactions/apply_recurrent?month=${selectedMonth}&year=${selectedYear}`,
                null,
                { headers: getHeaders() }
            );
            const applied = res.data?.applied ?? 0;
            setRecurrentApplied(applied);
            if (applied > 0) await fetchData();
        } catch {
            setRecurrentApplied(0);
        } finally {
            setApplyingRecurrent(false);
        }
    };

    // Filtragem local em cima dos dados já carregados
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchSearch = !search || t.descricao.toLowerCase().includes(search.toLowerCase());
            const matchCategoria = !filterCategoria || t.categoria === filterCategoria;
            const matchTipo = !filterTipo || t.tipo === filterTipo;
            return matchSearch && matchCategoria && matchTipo;
        });
    }, [transactions, search, filterCategoria, filterTipo]);

    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE));
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * TRANSACTIONS_PER_PAGE,
        currentPage * TRANSACTIONS_PER_PAGE
    );

    useEffect(() => { setCurrentPage(1); }, [search, filterCategoria, filterTipo]);

    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setShowTransactionForm(true);
    };

    const handleDeleteClick = (id: string) => {
        setTransactionToDelete(id);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!transactionToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/transactions/${transactionToDelete}`, { headers: getHeaders() });
            await fetchData();
            setShowDeleteModal(false);
        } catch {
            alert('Erro ao excluir. Tente novamente.');
        } finally {
            setIsDeleting(false);
            setTransactionToDelete(null);
        }
    };

    const handleFinishWelcome = async (initialBalance: number) => {
        try {
            if (initialBalance > 0) {
                await api.post('/transactions/', {
                    descricao: 'Saldo Inicial (Início do App)',
                    valor: initialBalance,
                    tipo: 'RECEITA',
                    categoria: 'Outros',
                    date: new Date().toISOString().split('T')[0]
                }, { headers: { 'x-clerk-id': userId } });
            }
            localStorage.setItem(`welcome_seen_${userId}`, 'true');
            setShowWelcome(false);
            fetchData();
        } catch {
            setShowWelcome(false);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!window.confirm('Deseja realmente excluir esta meta?')) return;
        try {
            await api.delete(`/goals/${goalId}`, { headers: getHeaders() });
            setGoals(prev => prev.filter(g => g.id !== goalId));
        } catch {
            alert('Erro ao excluir meta.');
        }
    };

    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) return;
        const header = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor'];
        const rows = filteredTransactions.map(t => [
            new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
            `"${t.descricao.replace(/"/g, '""')}"`,
            t.tipo,
            t.categoria,
            t.valor.toFixed(2).replace('.', ',')
        ]);
        const csv = [header, ...rows].map(r => r.join(';')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dinheirinho_${MONTHS[selectedMonth - 1]}_${selectedYear}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isLoaded || (loading && !summary)) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-screen text-green-700 font-bold animate-pulse">
                    Carregando Dinheirinho...
                </div>
            </AppLayout>
        );
    }

    const saldo = summary?.total_balance ?? 0;
    const revenueDelta = getDelta(summary?.total_revenue ?? 0, prevSummary?.total_revenue ?? 0);
    const expenseDelta = getDelta(summary?.total_expense ?? 0, prevSummary?.total_expense ?? 0);

    return (
        <AppLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-2 py-2 md:p-4 transition-colors duration-200 overflow-x-hidden w-full" style={{ maxWidth: '100%' }}>
            <div className="container mx-auto max-w-5xl w-full overflow-x-hidden">

                {/* Header */}
                <div className="flex flex-col mb-6 pt-3 w-full max-w-full">
                    <div className="flex items-center justify-between w-full min-w-0">
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#6ee7b7 0%,#059669 100%)' }}>
                                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                                    <text x="10" y="16" fontFamily="Arial Black, Arial, sans-serif" fontSize="16" fontWeight="900" fill="white" textAnchor="middle">$</text>
                                </svg>
                            </div>
                            <h1 className="text-xl md:text-3xl font-extrabold text-green-700 dark:text-green-400 leading-none">Dinheirinho</h1>
                        </div>
                        {loading && (
                            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] px-3 py-1 rounded-full shadow-lg z-[100] animate-bounce">
                                Atualizando dados...
                            </div>
                        )}
                        {/* Desktop: PRO + Lançamento */}
                        <div className="flex items-center gap-2 shrink-0">
                            {!isPro && (
                                <button
                                    onClick={() => setShowPricingModal(true)}
                                    className="hidden md:flex items-center gap-1.5 bg-linear-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-900 font-black py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-amber-200 dark:shadow-amber-900/30 transition-all active:scale-95"
                                >
                                    <Crown className="w-3.5 h-3.5" /> Seja PRO
                                </button>
                            )}
                            <button
                                onClick={() => setShowTransactionForm(true)}
                                className="hidden md:flex bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm whitespace-nowrap items-center gap-1.5"
                            >
                                <Plus className="w-3.5 h-3.5" /> Lançamento
                            </button>
                        </div>
                    </div>
                </div>

                {/* Erro de fetch */}
                {fetchError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium flex items-center justify-between w-full max-w-full">
                        <span>{fetchError}</span>
                        <button onClick={fetchData} className="text-red-700 dark:text-red-400 font-bold underline text-xs">Tentar novamente</button>
                    </div>
                )}

                {/* Seja PRO — mobile, logo acima dos recorrentes */}
                {!isPro && (
                    <button
                        onClick={() => setShowPricingModal(true)}
                        className="w-full md:hidden flex items-center justify-center gap-1.5 bg-linear-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-900 font-black py-2 px-4 rounded-t-xl text-xs shadow-lg shadow-amber-200 dark:shadow-amber-900/30 transition-all active:scale-95"
                    >
                        <Crown className="w-3.5 h-3.5" /> Seja PRO — Desbloqueie tudo
                    </button>
                )}

                {/* Banner Transações Recorrentes */}
                {hasRecurrentPending && recurrentApplied === null && (
                    <div className={`mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 flex items-center justify-between gap-2 w-full max-w-full ${!isPro ? 'rounded-b-xl md:rounded-xl' : 'rounded-xl'}`}>
                        <p className="text-[11px] sm:text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 min-w-0">
                            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span className="truncate">Lançamentos recorrentes</span>
                            {!isPro && <span className="text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full shrink-0">PRO</span>}
                        </p>
                        <button
                            onClick={() => isPro ? handleApplyRecurrent() : setShowPricingModal(true)}
                            disabled={isPro && applyingRecurrent}
                            className="shrink-0 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-lg transition-all disabled:opacity-60 flex items-center gap-1"
                        >
                            {!isPro && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            )}
                            {isPro && applyingRecurrent ? 'Aplicando...' : 'Aplicar'}
                        </button>
                    </div>
                )}
                {recurrentApplied !== null && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl text-xs font-bold text-green-700 dark:text-green-400 w-full max-w-full">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            {recurrentApplied === 0
                                ? 'Recorrentes já aplicados para este mês.'
                                : `${recurrentApplied} lançamento${recurrentApplied !== 1 ? 's' : ''} recorrente${recurrentApplied !== 1 ? 's' : ''} adicionado${recurrentApplied !== 1 ? 's' : ''}!`
                            }
                        </span>
                    </div>
                )}

                {/* Resumo Financeiro */}
                <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-xl mb-8 border-t-4 md:border-t-8 border-green-600 w-full max-w-full overflow-hidden">
                    <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
                        {/* Navegação de mês */}
                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-1 min-w-0">
                            <button
                                onClick={() => {
                                    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
                                    else setSelectedMonth(m => m - 1);
                                }}
                                aria-label="Mês anterior"
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm text-gray-400 dark:text-gray-400 hover:text-gray-700 font-bold transition-all text-lg"
                            >
                                ‹
                            </button>

                            <div className="flex items-center gap-1 px-1">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="bg-transparent text-gray-800 dark:text-gray-100 text-sm font-bold outline-none cursor-pointer"
                                >
                                    {MONTHS.map((m, i) => (
                                        <option key={m} value={i + 1}>{m}</option>
                                    ))}
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
                                aria-label="Próximo mês"
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm text-gray-400 dark:text-gray-400 hover:text-gray-700 font-bold transition-all text-lg"
                            >
                                ›
                            </button>
                        </div>
                        {/* Botão Ocultar/Mostrar valores */}
                        <button
                            onClick={() => setShowValues(!showValues)}
                            aria-label={showValues ? 'Ocultar valores' : 'Mostrar valores'}
                            className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-2 rounded-xl text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                            {showValues ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{showValues ? 'Ocultar' : 'Mostrar'}</span>
                        </button>
                    </div>

                    {/* Mobile: 1 coluna empilhada. Desktop: 3 colunas iguais */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                        {/* Saldo Atual */}
                        <div className="px-3 py-2 md:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 flex flex-col justify-center">
                            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Saldo</p>
                            <p className={`text-base md:text-2xl font-black mt-0.5 truncate ${saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {maskedValue(saldo, showValues)}
                            </p>
                            {(summary?.saldo_anterior ?? 0) !== 0 && (
                                <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">
                                    +{formatMoney(Math.abs(summary?.saldo_anterior ?? 0))} acum.
                                </p>
                            )}
                        </div>

                        {/* Receitas */}
                        <div className="px-3 py-2 md:p-4 rounded-xl bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                            <div className="flex items-center justify-between gap-1">
                                <p className="text-[9px] md:text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Receitas</p>
                                {revenueDelta && (
                                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full hidden sm:inline ${revenueDelta.up ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}`}>
                                        {revenueDelta.up ? '▲' : '▼'} {revenueDelta.pct.toFixed(0)}%
                                    </span>
                                )}
                            </div>
                            <p className="text-sm md:text-2xl font-black text-green-700 dark:text-green-400 mt-0.5 truncate">
                                {maskedValue(summary?.total_revenue ?? 0, showValues)}
                            </p>
                        </div>

                        {/* Gastos */}
                        <div className="px-3 py-2 md:p-4 rounded-xl bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                            <div className="flex items-center justify-between gap-1">
                                <p className="text-[9px] md:text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Gastos</p>
                                {expenseDelta && (
                                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full hidden sm:inline ${!expenseDelta.up ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}`}>
                                        {expenseDelta.up ? '▲' : '▼'} {expenseDelta.pct.toFixed(0)}%
                                    </span>
                                )}
                            </div>
                            <p className="text-sm md:text-2xl font-black text-red-700 dark:text-red-400 mt-0.5 truncate">
                                {maskedValue(summary?.total_expense ?? 0, showValues)}
                            </p>
                        </div>
                    </div>

                    {/* Botão + Lançamento — mobile only, abaixo do card de saldo */}
                    <button
                        onClick={() => setShowTransactionForm(true)}
                        className="md:hidden mt-3 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-bold py-3 rounded-xl text-sm shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4" /> Lançamento
                    </button>
                </div>

                {/* METAS */}
                <div className="mt-8 md:mt-12 w-full max-w-full overflow-hidden">
                    <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight mb-3">Minhas Metas</h2>

                    {/* Botão Nova Meta — acima dos cards */}
                    <button
                        onClick={() => {
                            const activeCount = goals.filter(g => g.status === 'ATIVA').length;
                            if (!isPro && activeCount >= 2) {
                                setShowPricingModal(true);
                            } else {
                                setEditingGoal(null);
                                setShowGoalForm(true);
                            }
                        }}
                        className="w-full mb-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 font-bold py-2 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                    >
                        {!isPro && goals.filter(g => g.status === 'ATIVA').length >= 2 ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <span className="text-base leading-none">+</span>
                        )}
                        Nova Meta
                    </button>

                    {goals.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Nenhuma meta criada ainda.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 w-full overflow-hidden">
                            {goals.map((goal, index) => {
                                const isLastAndOdd = index === goals.length - 1 && goals.length % 2 !== 0;
                                return (
                                    <div key={goal.id} className={`min-w-0 overflow-hidden transition-all hover:scale-[1.005] ${isLastAndOdd ? 'md:col-span-2' : 'md:col-span-1'}`}>
                                        <GoalCard
                                            goal={goal}
                                            showValues={showValues}
                                            onEdit={(g) => { setEditingGoal(g); setShowGoalForm(true); }}
                                            onDelete={() => handleDeleteGoal(goal.id)}
                                            onAddProgress={() => {
                                                setProgressGoalId(goal.id);
                                                setProgressGoalDescription(goal.descricao);
                                                setShowProgressForm(true);
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-6 mt-8 md:mt-12 w-full max-w-full overflow-hidden">
                    <div className="sm:col-span-1 lg:col-span-5 bg-white dark:bg-gray-800 p-3 md:p-6 rounded-2xl shadow-lg">
                        <h2 className="text-sm md:text-lg font-bold mb-3 md:mb-6 text-gray-800 dark:text-gray-100">Divisão de Gastos</h2>
                        {summary
                            ? <ExpensePieChart data={summary.expense_by_category} totalExpense={summary.total_expense} showValues={showValues} />
                            : <div className="h-[200px] md:h-80 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
                        }
                    </div>
                    <div className="sm:col-span-1 lg:col-span-7 bg-white dark:bg-gray-800 p-3 md:p-6 rounded-2xl shadow-lg overflow-hidden min-w-0 max-w-full flex flex-col">
                        <h2 className="text-sm md:text-lg font-bold mb-3 md:mb-6 text-gray-800 dark:text-gray-100 shrink-0">Evolução da Pilha</h2>
                        <div className="flex-1 min-h-0">
                            {loading
                                ? <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" style={{ height: '220px' }} />
                                : <BalanceChart data={balanceHistory} />
                            }
                        </div>
                    </div>
                </div>

                {/* Histórico de Lançamentos */}
                <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-2xl shadow-lg my-12 w-full max-w-full overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                            <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight">Histórico de Lançamentos</h2>
                            {filteredTransactions.length > 0 && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{filteredTransactions.length} lançamento{filteredTransactions.length !== 1 ? 's' : ''} encontrado{filteredTransactions.length !== 1 ? 's' : ''}</p>
                            )}
                        </div>
                        <button
                            onClick={() => isPro
                                ? handleExportCSV()
                                : setShowPricingModal(true)
                            }
                            disabled={isPro && filteredTransactions.length === 0}
                            aria-label="Exportar transações em CSV"
                            className="flex items-center gap-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none whitespace-nowrap"
                        >
                            {isPro ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            )}
                            Exportar CSV
                        </button>
                    </div>

                    {/* Barra de filtros */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Buscar por descrição..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-green-400 text-gray-700"
                        />
                        <select
                            value={filterCategoria}
                            onChange={(e) => setFilterCategoria(e.target.value)}
                            className="w-full sm:w-auto border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-green-400 text-gray-700"
                        >
                            <option value="">Todas as categorias</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                            value={filterTipo}
                            onChange={(e) => setFilterTipo(e.target.value)}
                            className="w-full sm:w-auto border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-green-400 text-gray-700"
                        >
                            <option value="">Todos os tipos</option>
                            <option value="RECEITA">Receita</option>
                            <option value="GASTO">Gasto</option>
                        </select>
                    </div>

                    {/* Tabela (desktop) */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 text-[10px] uppercase">
                                    <th className="py-3 px-2">Data</th>
                                    <th className="py-3 px-2">Descrição</th>
                                    <th className="py-3 px-2">Categoria</th>
                                    <th className="py-3 px-2 text-right">Valor</th>
                                    <th className="py-3 px-2 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700 text-xs">
                                {paginatedTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-gray-500">
                                            Nenhum lançamento encontrado.
                                        </td>
                                    </tr>
                                ) : paginatedTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="py-4 px-2 text-gray-500 dark:text-gray-400">
                                            {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })}
                                        </td>
                                        <td className="py-4 px-2 text-gray-800 dark:text-gray-200 font-medium">
                                            {t.descricao}
                                            {t.recorrente && <RefreshCw className="inline ml-1.5 w-3 h-3 text-blue-500" />}
                                        </td>
                                        <td className="py-4 px-2">
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-[10px] font-semibold">{t.categoria}</span>
                                        </td>
                                        <td className={`py-4 px-2 text-right font-black ${t.tipo === 'RECEITA' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                            {maskedValue(t.valor, showValues)}
                                        </td>
                                        <td className="py-4 px-2 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditTransaction(t)}
                                                    aria-label={`Editar ${t.descricao}`}
                                                    className="p-1.5 text-gray-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(t.id)}
                                                    aria-label={`Excluir ${t.descricao}`}
                                                    className="p-1.5 text-gray-600 dark:text-white hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Cards mobile */}
                    <div className="sm:hidden flex flex-col gap-2 w-full overflow-hidden">
                        {paginatedTransactions.length === 0 ? (
                            <p className="py-8 text-center text-gray-400 dark:text-gray-500 text-sm">Nenhum lançamento encontrado.</p>
                        ) : paginatedTransactions.map((t) => (
                            <div key={t.id} className="relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 w-full max-w-full">
                                {/* Barra lateral colorida por tipo */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.tipo === 'RECEITA' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <div className="pl-3 pr-2 py-2.5 flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                                            {t.descricao}{t.recorrente && <RefreshCw className="inline ml-1.5 w-3 h-3 text-blue-500" />}
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                                            {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })} · {t.categoria}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-black shrink-0 ${t.tipo === 'RECEITA' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                        {t.tipo === 'RECEITA' ? '+' : '-'}{maskedValue(t.valor, showValues)}
                                    </span>
                                    <div className="flex items-center shrink-0 border-l border-gray-100 dark:border-gray-700 pl-2 gap-1">
                                        <button onClick={() => handleEditTransaction(t)} aria-label={`Editar ${t.descricao}`} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleDeleteClick(t.id)} aria-label={`Excluir ${t.descricao}`} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                {filteredTransactions.length} lançamento{filteredTransactions.length !== 1 ? 's' : ''} · página {currentPage} de {totalPages}
                            </p>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    aria-label="Página anterior"
                                    className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-600 dark:text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    ‹
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, idx) => p === '...'
                                        ? <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-gray-400 dark:text-gray-500">…</span>
                                        : (
                                            <button
                                                key={p}
                                                onClick={() => setCurrentPage(p as number)}
                                                className={`px-3 py-1 text-xs border rounded-lg transition-colors ${currentPage === p ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )
                                }
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    aria-label="Próxima página"
                                    className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-600 dark:text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modais */}
            <WelcomeModal isOpen={showWelcome} userName={user?.firstName} onFinish={handleFinishWelcome} />
            {showGoalForm && (
                <GoalForm
                    onClose={() => { setShowGoalForm(false); setEditingGoal(null); }}
                    onGoalCreated={fetchData}
                    goalToEdit={editingGoal}
                />
            )}
            {showProgressForm && progressGoalId && (
                <GoalProgressForm
                    onClose={() => setShowProgressForm(false)}
                    onProgressAdded={fetchData}
                    goalId={progressGoalId}
                    goalDescription={progressGoalDescription}
                />
            )}
            {showTransactionForm && (
                <TransactionForm
                    onClose={() => { setShowTransactionForm(false); setEditingTransaction(null); }}
                    onTransactionCreated={fetchData}
                    transactionToEdit={editingTransaction ?? undefined}
                />
            )}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Lançamento?"
                message="Tem certeza?"
                loading={isDeleting}
            />
            <PricingModal
                isOpen={showPricingModal}
                onClose={() => setShowPricingModal(false)}
            />

        </div>
        </AppLayout>
    );
}
