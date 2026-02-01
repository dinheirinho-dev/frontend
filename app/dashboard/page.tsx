"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useAuth, useUser, useClerk, UserButton } from "@clerk/nextjs";
import api from '../../src/services/api';

import ConfirmModal from '../components/ConfirmModal';
import GoalCard from '../components/GoalCard';
import ExpensePieChart from '../components/ExpensePieChart';
import GoalForm from '../components/GoalForm';
import TransactionForm from '../components/TransactionForm';
import GoalProgressForm from '../components/GoalProgressForm';
import BalanceChart from '../components/BalanceChart';
import WelcomeModal from '../components/WelcomeModal'; // 1. Importação do novo componente

interface FinancialSummary { total_balance: number; total_revenue: number; total_expense: number; expense_by_category: any[]; }
interface Transaction { id: string; descricao: string; valor: number; tipo: 'GASTO' | 'RECEITA'; categoria: string; date: string; }
interface Goal { id: string; descricao: string; valor_alvo: number; valor_atual: number; data_limite: string; }

export default function DashboardPage() {
    const { userId, isLoaded } = useAuth();
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [balanceHistory, setBalanceHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showValues, setShowValues] = useState(true);

    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [showProgressForm, setShowProgressForm] = useState(false);
    const [progressGoalId, setProgressGoalId] = useState<string | null>(null);
    const [progressGoalDescription, setProgressGoalDescription] = useState<string>('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // 2. Estado para o Modal de Boas-vindas
    const [showWelcome, setShowWelcome] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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
            await api.delete(`/transactions/${transactionToDelete}`, {
                headers: { 'x-clerk-id': userId }
            });
            fetchData();
            setShowDeleteModal(false);
        } catch (err) {
            alert("Erro ao excluir. Tente novamente.");
        } finally {
            setIsDeleting(false);
            setTransactionToDelete(null);
        }
    };

    const fetchData = useCallback(async () => {
        if (!userId || !user) return;
        setLoading(true);

        try {
            const headers = { 'x-clerk-id': userId, 'x-clerk-email': user.primaryEmailAddress?.emailAddress };
            const queryParams = `?month=${selectedMonth}&year=${selectedYear}`;

            const [summaryRes, transRes, goalsRes, historyRes] = await Promise.all([
                api.get(`/summary/${queryParams}`, { headers }),
                api.get(`/transactions/${queryParams}`, { headers }),
                api.get('/goals/', { headers }),
                api.get(`/balance_history/${queryParams}`, { headers })
            ]);

            setSummary(summaryRes.data);
            setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
            setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : []);
            setBalanceHistory(Array.isArray(historyRes.data) ? historyRes.data : []);

        } catch (err) {
            console.error("Erro no fetch:", err);
        } finally {
            setLoading(false);
        }
    }, [userId, user, selectedMonth, selectedYear]);

    // 3. Lógica para disparar o Boas-vindas se não houver transações
    useEffect(() => {
        // Só verificamos se o carregamento inicial terminou
        if (isLoaded && userId && !loading) {
            const hasSeenWelcome = localStorage.getItem(`welcome_seen_${userId}`);

            // Só mostra se: não viu o modal E não tem transações NO TOTAL
            // (Aqui usamos uma malandragem: se o saldo total é 0 e não tem nada na lista, 
            // mas o usuário está no mês atual)
            const isCurrentMonth = selectedMonth === new Date().getMonth() + 1;

            if (!hasSeenWelcome && transactions.length === 0 && isCurrentMonth) {
                setShowWelcome(true);
            }
        }
    }, [isLoaded, userId, loading, transactions.length, selectedMonth]);

    // 4. Função para processar o Saldo Inicial
    const handleFinishWelcome = async (initialBalance: number) => {
        try {
            if (initialBalance > 0) {
                const data = {
                    descricao: "Saldo Inicial (Início do App)",
                    valor: initialBalance,
                    tipo: 'RECEITA',
                    categoria: 'Outros',
                    date: new Date().toISOString().split('T')[0]
                };
                await api.post('/transactions/', data, { headers: { 'x-clerk-id': userId } });
            }

            // MARCAÇÃO: O navegador vai lembrar que este usuário já viu o modal
            localStorage.setItem(`welcome_seen_${userId}`, 'true');

            setShowWelcome(false);
            fetchData();
        } catch (err) {
            console.error("Erro ao salvar saldo inicial:", err);
            setShowWelcome(false);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!window.confirm("Deseja realmente excluir esta meta?")) return;
        try {
            const headers = { 'x-clerk-id': userId };
            await api.delete(`/goals/${goalId}`, { headers });
            setGoals(prev => prev.filter(g => g.id !== goalId));
            localStorage.setItem(`dinheirinho_onboarding_${userId}`, 'true'); // Salva que já viu
            setShowWelcome(false);
            fetchData();
        } catch (err) {
            console.error("Erro ao excluir meta:", err);
            alert("Erro ao excluir. Verifique se o backend está rodando.");
        }
    };

    useEffect(() => { if (isLoaded && userId) fetchData(); }, [isLoaded, userId, fetchData]);

    const renderValue = (value: number) => (
        <span>
            {showValues
                ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : "R$ ••••••"}
        </span>
    );

    if (!isLoaded || (loading && !summary)) {
        return <div className="flex items-center justify-center min-h-screen text-green-700 font-bold animate-pulse">Carregando Dinheirinho...</div>;
    }

    const saldo = summary?.total_balance || 0;

    return (
        <div className="min-h-screen bg-gray-50 p-2 md:p-4">
            <div className="container mx-auto max-w-5xl">

                {/* Header */}
                <div className="flex flex-col md:flex-col justify-between items-center mb-6 pt-4 gap-4 px-2">
                    <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between w-full md:w-auto gap-4">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-green-700">Dinheirinho</h1>
                            <UserButton afterSignOutUrl="/" />
                            {loading && (
                                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] px-3 py-1 rounded-full shadow-lg z-[100] animate-bounce">
                                    Atualizando dados...
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Conta de {user?.firstName}</p>
                    </div>

                    <div className="flex w-full gap-2 items-center justify-items-between md:justify-end">
                        <button onClick={() => setShowTransactionForm(true)} className="bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-lg flex-1 md:flex-none">+ Lançamento</button>
                        <button
                            onClick={() => setShowValues(!showValues)}
                            className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm text-[11px] font-bold text-gray-500 hover:bg-gray-200 transition-all"
                        >
                            {showValues ? "👁️ Ocultar" : "🔒 Mostrar"}
                        </button>
                    </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl mb-8 border-t-8 border-green-600 mx-2">
                    <div className='mb-5'>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="justify-end bg-white border border-gray-200 text-gray-700 text-xs font-bold py-1 px-3 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 outline-none"
                        >
                            <option value={1}>Janeiro</option>
                            <option value={2}>Fevereiro</option>
                            <option value={3}>Março</option>
                            <option value={4}>Abril</option>
                            <option value={5}>Maio</option>
                            <option value={6}>Junho</option>
                            <option value={7}>Julho</option>
                            <option value={8}>Agosto</option>
                            <option value={9}>Setembro</option>
                            <option value={10}>Outubro</option>
                            <option value={11}>Novembro</option>
                            <option value={12}>Dezembro</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Saldo Atual</p>
                            <p className={`text-xl md:text-2xl font-black mt-1 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {renderValue(saldo)}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-green-50/50 border border-green-100">
                            <p className="text-[10px] font-bold text-green-600 uppercase">Receitas</p>
                            <p className="text-xl md:text-2xl font-black text-green-700 mt-1">{renderValue(summary?.total_revenue || 0)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-50/50 border border-red-100">
                            <p className="text-[10px] font-bold text-red-600 uppercase">Gastos</p>
                            <p className="text-xl md:text-2xl font-black text-red-700 mt-1">{renderValue(summary?.total_expense || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* METAS */}
                <div className="mt-12 px-2">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Minhas Metas</h2>
                        </div>
                        <button
                            onClick={() => { setEditingGoal(null); setShowGoalForm(true); }}
                            className="bg-green-100 text-green-700 hover:bg-green-200 font-bold py-2 px-4 rounded-2xl transition-all text-xs flex items-center gap-1"
                        >
                            <span className="text-lg">+</span> Nova Meta
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {goals.map((goal, index) => {
                            const isLastAndOdd = index === goals.length - 1 && goals.length % 2 !== 0;
                            return (
                                <div
                                    key={goal.id}
                                    className={`transform transition-all hover:scale-[1.01] ${isLastAndOdd ? "md:col-span-2" : "md:col-span-1"}`}
                                >
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
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 mt-12 px-2">
                    <div className="lg:col-span-5 bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                        <h2 className="text-lg font-bold mb-6 text-gray-800">Divisão de Gastos</h2>
                        {summary && <ExpensePieChart
                            data={summary.expense_by_category}
                            totalExpense={summary.total_expense}
                            showValues={showValues}
                        />}
                    </div>
                    <div className="lg:col-span-7 bg-white p-4 md:p-6 rounded-2xl shadow-lg min-h-[350px]">
                        <h2 className="text-lg font-bold mb-6 text-gray-800">Evolução da Pilha</h2>
                        <BalanceChart data={balanceHistory} />
                    </div>
                </div>

                {/* Histórico */}
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg my-12 mx-2 overflow-hidden">
                    <h2 className="mb-4 text-xl font-black text-gray-800 tracking-tight">Histórico de Lançamentos</h2>
                    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                        <table className="w-full text-left min-w-[550px]">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase">
                                    <th className="py-3 px-2">Data</th>
                                    <th className="py-3 px-2">Descrição</th>
                                    <th className="py-3 px-2">Categoria</th>
                                    <th className="py-3 px-2 text-right">Valor</th>
                                    <th className="py-3 px-2 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.slice(0, 10).map((t) => (
                                    <tr key={t.id} className="text-xs hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-2 text-gray-500 font-medium">
                                            {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })}
                                        </td>
                                        <td className="py-4 px-2 text-gray-800 font-medium">{t.descricao}</td>
                                        <td className="py-4 px-2">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-semibold">{t.categoria}</span>
                                        </td>
                                        <td className={`py-4 px-2 text-right font-black ${t.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-500'}`}>
                                            {renderValue(t.valor)}
                                        </td>
                                        <td className="py-4 px-2 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleEditTransaction(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">✏️</button>
                                                <button onClick={() => handleDeleteClick(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modais */}
            <WelcomeModal
                isOpen={showWelcome}
                userName={user?.firstName}
                onFinish={handleFinishWelcome}
            />

            {showGoalForm && <GoalForm onClose={() => { setShowGoalForm(false); setEditingGoal(null); }} onGoalCreated={fetchData} goalToEdit={editingGoal} />}
            {showProgressForm && progressGoalId && <GoalProgressForm onClose={() => setShowProgressForm(false)} onProgressAdded={fetchData} goalId={progressGoalId} goalDescription={progressGoalDescription} />}
            {showTransactionForm && (
                <TransactionForm
                    onClose={() => { setShowTransactionForm(false); setEditingTransaction(null); }}
                    onTransactionCreated={fetchData}
                    transactionToEdit={editingTransaction}
                />
            )}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Lançamento?"
                message="Tem certeza? Essa ação vai remover o valor do seu saldo e do gráfico permanentemente."
                loading={isDeleting}
            />
        </div>
    );
}