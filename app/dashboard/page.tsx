"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import axios from 'axios';

// 1. IMPORTANTE: Usamos a nossa instância configurada
import api from '../../src/services/api';

import GoalCard from '../components/GoalCard';
import ExpensePieChart from '../components/ExpensePieChart';
import GoalForm from '../components/GoalForm';
import TransactionForm from '../components/TransactionForm';
import GoalProgressForm from '../components/GoalProgressForm';
import BalanceChart from '../components/BalanceChart';

// --- Interfaces Atualizadas para UUID (id: string) ---
interface CategorySummary { category: string; total_spent: number; }
interface FinancialSummary { total_balance: number; total_revenue: number; total_expense: number; expense_by_category: CategorySummary[]; }
interface Transaction { id: string; descricao: string; valor: number; tipo: 'GASTO' | 'RECEITA'; categoria: string; data_criacao: string; owner_id: string; }
interface Goal {
    id: string;
    descricao: string;
    valor_alvo: number;
    valor_atual: number;
    data_limite: string;
    owner_id: string;
}
type BalancePoint = {
    date: string;
    balance: number;
};

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [balanceHistory, setBalanceHistory] = useState<BalancePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [showProgressForm, setShowProgressForm] = useState(false);
    const [progressGoalId, setProgressGoalId] = useState<string | null>(null);
    const [progressGoalDescription, setProgressGoalDescription] = useState<string>('');

    const router = useRouter();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            // 2. CHAMADAS LIMPAS: O Token é injetado automaticamente pelo api.ts
            const [summaryRes, transRes, goalsRes, historyRes] = await Promise.all([
                api.get<FinancialSummary>('/summary/'),
                api.get<Transaction[]>('/transactions/'),
                api.get<Goal[]>('/goals/'),
                api.get<BalancePoint[]>('/balance_history/')
            ]);

            setSummary(summaryRes.data);
            setTransactions(transRes.data);
            setGoals(goalsRes.data);
            setBalanceHistory(historyRes.data);

        } catch (err) {
            // Se der erro 401, o interceptor ou essa lógica redirecionam
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                localStorage.removeItem('dinheirinho_token');
                router.push('/login');
            } else {
                setError('Erro ao carregar dados do Dashboard. Verifique a conexão.');
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem('dinheirinho_token');
        if (!token) {
            router.push('/login');
        } else {
            fetchData();
        }
    }, [fetchData, router]);

    // 3. HANDLERS ATUALIZADOS COM API
    const handleDeleteGoal = async (goalId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta meta?')) return;

        try {
            await api.delete(`/goals/${goalId}`);
            fetchData();
        } catch (error) {
            alert('Falha ao excluir meta.');
        }
    };

    const handleEditGoal = (goal: Goal) => {
        setEditingGoal(goal);
        setShowGoalForm(true);
    };

    const handleAddProgress = (goal: Goal) => {
        setProgressGoalId(goal.id);
        setProgressGoalDescription(goal.descricao);
        setShowProgressForm(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('dinheirinho_token');
        router.push('/login');
    };

    // --- Lógica de Renderização ---
    const saldo = summary?.total_balance || 0;
    let fraseMotivacional = "Seu Dinheirinho está em análise...";
    if (saldo > 0) fraseMotivacional = "✨ Pilha Crescente! Seu Dinheirinho está virando um Dinheirão!";
    else if (saldo === 0) fraseMotivacional = "💰 Saldo Neutro: Momento perfeito para definir uma meta!";
    else if (saldo < 0) fraseMotivacional = "⚠️ Atenção aos Gastos! Vamos virar esse saldo negativo.";

    if (loading) return <div className="text-center mt-20 text-lg font-medium text-green-700">Carregando Dinheirinho...</div>;

    if (error) return (
        <div className="text-center mt-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchData} className="bg-green-500 text-white px-4 py-2 rounded-lg">Tentar Novamente</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="container mx-auto max-w-5xl">
                {/* Cabeçalho */}
                <div className="flex justify-between items-center mb-8 pt-4 gap-4">
                    <h1 className="text-3xl font-extrabold text-green-700">Dinheirinho</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowTransactionForm(true)}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl transition shadow-md flex items-center text-sm"
                        >
                            <span className="text-xl mr-1">+</span> Lançamento
                        </button>
                        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl transition shadow-md text-sm">
                            Sair
                        </button>
                    </div>
                </div>

                {/* Card de Resumo */}
                <div className="bg-white p-6 rounded-2xl shadow-xl mb-10 border-t-8 border-green-500/80">
                    <p className={`text-xl font-bold mb-4 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {fraseMotivacional}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 rounded-xl bg-gray-100 shadow-sm">
                            <p className="text-sm font-medium text-gray-700">Saldo Atual</p>
                            <p className={`text-2xl sm:text-3xl font-black mt-1 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                R$ {saldo.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-green-100/50 shadow-sm">
                            <p className="text-sm font-medium text-green-700">Receitas</p>
                            <p className="text-2xl sm:text-3xl font-bold text-green-700 mt-1">
                                R$ {summary?.total_revenue.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-100/50 shadow-sm">
                            <p className="text-sm font-medium text-red-700">Gastos</p>
                            <p className="text-2xl sm:text-3xl font-bold text-red-700 mt-1">
                                R$ {summary?.total_expense.toFixed(2) || '0.00'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metas */}
                <div className="mt-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-700">Minhas Metas</h2>
                        <button
                            onClick={() => { setEditingGoal(null); setShowGoalForm(true); }}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl transition shadow-md text-sm"
                        >
                            <span className="text-xl mr-1">+</span> Meta
                        </button>
                    </div>

                    <div className="space-y-4">
                        {goals.length === 0 ? (
                            <div className="p-6 bg-yellow-50 rounded-xl shadow-md text-center text-yellow-700 border-l-4 border-yellow-400">
                                Defina sua primeira meta e comece a construir sua &quot;Pilha Crescente&quot;!
                            </div>
                        ) : (
                            goals.map((goal) => (
                                <GoalCard
                                    key={goal.id}
                                    goal={goal}
                                    onEdit={handleEditGoal}
                                    onDelete={() => handleDeleteGoal(goal.id)}
                                    onAddProgress={() => handleAddProgress(goal)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
                    <div className="lg:col-span-4">
                        <h2 className="text-2xl font-bold mb-4 text-gray-700">Gastos por Categoria</h2>
                        {summary && (
                            <ExpensePieChart
                                data={summary.expense_by_category}
                                totalExpense={summary.total_expense}
                            />
                        )}
                    </div>
                    <div className="lg:col-span-8">
                        <h2 className="text-2xl font-bold mb-4 text-gray-700">Evolução do Saldo</h2>
                        <BalanceChart data={balanceHistory} />
                    </div>
                </div>

                {/* Histórico */}
                <div className="mt-10 mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-gray-700">Histórico de Transações</h2>
                    <div className="space-y-3 p-4 bg-white rounded-xl shadow-md">
                        {transactions.length === 0 ? (
                            <p className="text-gray-500 text-center">Nenhuma transação registrada.</p>
                        ) : (
                            transactions.map((t) => {
                                const isExpense = t.tipo.toUpperCase() === 'GASTO';
                                return (
                                    <div key={t.id} className="p-3 rounded-lg flex justify-between items-center border-b border-gray-100 last:border-b-0">
                                        <span className={`text-xl font-bold mr-4 ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
                                            {isExpense ? '➖' : '➕'}
                                        </span>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800">{t.descricao}</p>
                                            <p className="text-xs text-gray-500">{t.categoria} - {new Date(t.data_criacao).toLocaleDateString()}</p>
                                        </div>
                                        <p className={`text-lg font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                                            {isExpense ? '-' : '+'} R$ {t.valor.toFixed(2)}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Modais Iguais */}
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
                    onClose={() => setShowTransactionForm(false)}
                    onTransactionCreated={fetchData}
                />
            )}
        </div>
    );
}