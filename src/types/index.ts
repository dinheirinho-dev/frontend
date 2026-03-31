export type TipoTransacao = 'RECEITA' | 'GASTO';
export type GoalStatus = 'ATIVA' | 'CONCLUIDA' | 'ABANDONADA';

export interface Transaction {
    id: string;
    descricao: string;
    valor: number;
    tipo: TipoTransacao;
    categoria: string;
    date: string;
    recorrente?: boolean;
    periodicidade?: 'mensal' | 'semanal' | null;
    owner_id: string;
}

export interface Goal {
    id: string;
    descricao: string;
    valor_alvo: number;
    valor_atual: number;
    data_limite: string;
    status: GoalStatus;
    data_conclusao: string | null;
    owner_id: string;
}

export interface CategorySummary {
    category: string;
    total_spent: number;
}

export interface FinancialSummary {
    total_balance: number;
    total_revenue: number;
    total_expense: number;
    saldo_anterior: number;
    expense_by_category: CategorySummary[];
}

export interface BalancePoint {
    date: string;
    balance: number;
}
