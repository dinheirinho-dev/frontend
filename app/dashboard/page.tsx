"use client";

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Ajuste os imports para o seu caminho real:
import GoalCard from '../components/GoalCard';
import ExpensePieChart from '../components/ExpensePieChart';
import GoalForm from '../components/GoalForm';
import TransactionForm from '../components/TransactionForm';
import GoalProgressForm from '../components/GoalProgressForm'; // Importar o novo modal de progresso
import BalanceChart from '../components/BalanceChart'; //

// URL base da API FastAPI
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// --- Interfaces Padrão (Baseadas nos schemas.py) ---
interface CategorySummary { category: string; total_spent: number; }
interface FinancialSummary { total_balance: number; total_revenue: number; total_expense: number; expense_by_category: CategorySummary[]; }
interface Transaction { id: number; descricao: string; valor: number; tipo: 'GASTO' | 'RECEITA'; categoria: string; data_criacao: string; owner_id: number; }
interface Goal {
    id: number;
    descricao: string;
    valor_alvo: number;
    valor_atual: number;
    data_limite: string;
    owner_id: number;
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

    // ESTADOS PARA CONTROLE DE MODAL E EDIÇÃO
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [showProgressForm, setShowProgressForm] = useState(false);
    const [progressGoalId, setProgressGoalId] = useState<number | null>(null);
    const [progressGoalDescription, setProgressGoalDescription] = useState<string>('');

    const router = useRouter();


    // ----------------------------------------------------
    // FUNÇÃO DE BUSCA DE DADOS (USADA PARA RECARGA)
    // ----------------------------------------------------
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('dinheirinho_token');

        if (!token) {
            router.push('/login');
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        try {
            setLoading(true);

            const summaryResponse = await axios.get<FinancialSummary>(`${API_URL}/summary/`, { headers });
            const transactionsResponse = await axios.get<Transaction[]>(`${API_URL}/transactions/`, { headers });
            const goalsResponse = await axios.get<Goal[]>(`${API_URL}/goals/`, { headers });
            const historyResponse = await axios.get<BalancePoint[]>(`${API_URL}/balance_history/`, { headers });

            setSummary(summaryResponse.data);
            setTransactions(transactionsResponse.data);
            setGoals(goalsResponse.data);
            setBalanceHistory(historyResponse.data);

        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                localStorage.removeItem('dinheirinho_token');
                router.push('/login');
            } else {
                setError('Erro ao carregar dados do Dashboard. Verifique a API.');
            }
        } finally {
            setLoading(false);
        }
    }, [router]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ----------------------------------------------------
    // HANDLERS DE AÇÃO
    // ----------------------------------------------------

    // 1. EXCLUIR META
    const handleDeleteGoal = async (goalId: number) => {
        if (!confirm('Tem certeza que deseja excluir esta meta?')) return;

        const token = localStorage.getItem('dinheirinho_token');
        try {
            await axios.delete(`${API_URL}/goals/${goalId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            alert('Falha ao excluir meta. Tente novamente.');
        }
    };

    // 2. ABRIR MODAL PARA EDIÇÃO
    const handleEditGoal = (goal: Goal) => {
        setEditingGoal(goal);
        setShowGoalForm(true);
    };

    // 3. ABRIR MODAL DE PROGRESSO
    const handleAddProgress = (goal: Goal) => {
        setProgressGoalId(goal.id);
        setProgressGoalDescription(goal.descricao);
        setShowProgressForm(true);
    };

    // Função de Logout
    const handleLogout = () => {
        localStorage.removeItem('dinheirinho_token');
        router.push('/login');
    };

    // ... (Lógica de Renderização de Status e Frase Motivacional)

    const saldo = summary?.total_balance || 0;
    let fraseMotivacional = "Seu Dinheirinho está em análise...";
    if (saldo > 0) {
        fraseMotivacional = "✨ Pilha Crescente! Seu Dinheirinho está virando um Dinheirão!";
    } else if (saldo === 0) {
        fraseMotivacional = "💰 Saldo Neutro: Momento perfeito para definir uma meta!";
    } else if (saldo < 0) {
        fraseMotivacional = "⚠️ Atenção aos Gastos! Vamos virar esse saldo negativo.";
    }

    if (loading) {
        return <div className="text-center mt-20 text-lg">Carregando Dinheirinho...</div>;
    }
    if (error) {
        return <div className="text-center mt-20 text-red-500">{error}</div>;
    }


    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="container mx-auto max-w-5xl">

                {/* Cabeçalho */}
                <div className="flex justify-between items-center mb-8 pt-4 gap-4"> {/* ADICIONADO: gap-4 */}
                    <h1 className="text-3xl font-extrabold text-green-700">Dinheirinho</h1>
                    {/* Botão de Lançamento */}
                    <button
                        onClick={() => setShowTransactionForm(true)}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl transition duration-200 shadow-md flex items-center text-sm flex-shrink-0"
                    >
                        <span className="text-xl mr-1">+</span> Lançamento
                    </button>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl transition duration-200 shadow-md flex items-center text-sm flex-shrink-0">
                        Sair
                    </button>
                </div>

                {/* 💥 1. CARD DE RESUMO E FRASES MOTIVACIONAIS (SALDOS) */}
                <div className="bg-white p-6 rounded-2xl shadow-xl mb-10 border-t-8 border-green-500/80">
                    <p className={`text-xl font-bold mb-4 ${saldo > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {fraseMotivacional}
                    </p>

                    {/* Grid de Saldo, Receitas e Gastos */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center"> {/* ALTERADO: grid-cols-2 md:grid-cols-3 */}
                        {/* Card Saldo Atual */}
                        <div className="p-4 rounded-xl bg-gray-100 shadow-sm">
                            <p className="text-sm font-medium text-gray-700">Saldo Atual</p>
                            <p className={`text-2xl sm:text-3xl font-black mt-1 ${saldo > 0 ? 'text-green-600' : saldo < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                R$ {saldo.toFixed(2)}
                            </p>
                        </div>
                        {/* Receitas */}
                        <div className="p-4 rounded-xl bg-green-100/50 shadow-sm">
                            <p className="text-sm font-medium text-green-700">Receitas</p>
                            <p className="text-2xl sm:text-3xl font-bold text-green-700 mt-1">
                                R$ {summary?.total_revenue.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        {/* Gastos */}
                        <div className="p-4 rounded-xl bg-red-100/50 shadow-sm">
                            <p className="text-sm font-medium text-red-700">Gastos</p>
                            <p className="text-2xl sm:text-3xl font-bold text-red-700 mt-1">
                                R$ {summary?.total_expense.toFixed(2) || '0.00'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. METAS FINANCEIRAS (Gamificação) */}
                <div className="mt-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-700">Minhas Metas (Pilha Crescente)</h2>
                        <button
                            onClick={() => { setEditingGoal(null); setShowGoalForm(true); }}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 sm:py-2 sm:px-4 rounded-xl transition duration-200 shadow-md flex items-center text-sm flex-shrink-0"
                        >
                            <span className="text-xl mr-1">+</span> Meta
                        </button>
                    </div>

                    {/* Listagem de Metas */}
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
                                    onDelete={handleDeleteGoal}
                                    onAddProgress={handleAddProgress}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* 💥 1. GRÁFICOS (Gráfico de Pizza e Histórico de Saldo - Lado a Lado) */}
                {/* 💥 GRÁFICOS: Ajuste da Proporção para 35% / 65% */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">

                    {/* COLUNA 1: Gráfico de Pizza (35% da largura) */}
                    <div className="lg:col-span-4">
                        <h2 className="text-2xl font-bold mb-4 text-gray-700">Visão Geral de Gastos</h2>
                        {summary && (
                            <ExpensePieChart
                                data={summary.expense_by_category}
                                totalExpense={summary.total_expense}
                            />
                        )}
                    </div>

                    {/* COLUNA 2: Progresso de Saldo Acumulado (65% da largura) */}
                    <div className="lg:col-span-8">
                        <h2 className="text-2xl font-bold mb-4 text-gray-700">Progresso de Saldo Acumulado</h2>
                        {/* Gráfico de Linha */}
                        <BalanceChart data={balanceHistory} />
                    </div>

                </div>

                {/* 💥 2. HISTÓRICO DE TRANSAÇÕES (NOVA SEÇÃO 100% DE LARGURA) */}
                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-4 text-gray-700">Histórico de Transações</h2>
                    <div className="space-y-3 p-4 bg-white rounded-xl shadow-md">
                        {/* Aqui vai a lógica de listagem de transações que você já tem */}
                        {transactions.length === 0 ? (
                            <p className="text-gray-500">Nenhuma transação registrada.</p>
                        ) : (
                            transactions.map((t) => {
                                const tipoNormalizado = t.tipo.toUpperCase().trim();
                                const isExpense = tipoNormalizado === 'GASTO';
                                // ... (Seu código de renderização de cada transação aqui)
                                return (
                                    <div key={t.id} className={`p-3 rounded-lg flex justify-between items-center border-b border-gray-100 last:border-b-0`}>
                                        <span className={`text-xl font-bold mr-4 ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
                                            {isExpense ? '➖' : '➕'}
                                        </span>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800">{t.descricao}</p>
                                            <p className="text-xs text-gray-500">{t.categoria} - {new Date(t.data_criacao).toLocaleDateString()}</p>
                                        </div>
                                        <p className={`text-xl font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                                            {isExpense ? '-' : '+'} R$ {t.valor.toFixed(2)}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* MODAIS */}

            {/* Modal de Criação/Edição de Meta */}
            {
                showGoalForm && (
                    <GoalForm
                        onClose={() => { setShowGoalForm(false); setEditingGoal(null); }}
                        onGoalCreated={fetchData}
                        goalToEdit={editingGoal}
                    />
                )
            }

            {/* Modal de Adicionar Progresso */}
            {
                showProgressForm && progressGoalId !== null && (
                    <GoalProgressForm
                        onClose={() => setShowProgressForm(false)}
                        onProgressAdded={fetchData}
                        goalId={progressGoalId}
                        goalDescription={progressGoalDescription}
                    />
                )
            }

            {/* Modal de Novo Lançamento (Atalho) */}
            {
                showTransactionForm && (
                    <TransactionForm
                        onClose={() => setShowTransactionForm(false)}
                        onTransactionCreated={fetchData}
                    />
                )
            }

        </div >
    );
}