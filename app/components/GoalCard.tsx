import React from 'react';

interface Goal {
    id: string;
    descricao: string;
    valor_alvo: number;
    valor_atual: number;
    data_limite: string;
    owner_id?: string;
}

interface GoalCardProps {
    goal: Goal;
    showValues: boolean;
    onEdit: (goal: Goal) => void;
    onDelete: (goalId: string) => void;
    onAddProgress: (goal: Goal) => void;
}

export default function GoalCard({ goal, showValues, onEdit, onDelete, onAddProgress }: GoalCardProps) {
    const progress = Math.min((goal.valor_atual / goal.valor_alvo) * 100, 100);
    const dueDate = new Date(goal.data_limite).toLocaleDateString('pt-BR');

    // Formatação de valores com proteção de privacidade e trava de quebra de linha
    const formatValue = (val: number) => (
        <span className="font-bold">
            {showValues
                ? `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : "R$ ••••••"}
        </span>
    );

    return (
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group h-full">
            {/* Indicador de Status lateral */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${progress >= 100 ? 'bg-emerald-500' : 'bg-green-600'}`} />

            <div className="flex flex-col h-full justify-between gap-5">

                {/* Header: Título, Badge e Porcentagem */}
                <div className="flex justify-between items-start pl-2">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 tracking-tight leading-tight break-words">{goal.descricao}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${progress >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-green-50 text-green-600'}`}>
                                {progress >= 100 ? 'Concluída' : 'Em Foco'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Prazo: {dueDate}</span>
                        </div>
                    </div>
                    <div className="text-right ml-4">
                        <span className="text-2xl font-black text-gray-900 leading-none">{progress.toFixed(0)}%</span>
                    </div>
                </div>

                {/* Barra de Progresso */}
                <div className="px-2">
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${progress >= 100 ? 'bg-emerald-500' : 'bg-green-600'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Info de Valores e Ações - Flex dinâmico para não quebrar */}
                <div className="flex flex-wrap md:flex-nowrap justify-between items-end gap-4 pl-2 pt-1">

                    {/* Container de Valores */}
                    <div className="flex gap-6 sm:gap-10 overflow-hidden flex-shrink-1">
                        <div className="flex flex-col min-w-fit">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider whitespace-nowrap">Acumulado</span>
                            <span className="text-sm font-bold text-green-600">
                                {formatValue(goal.valor_atual)}
                            </span>
                        </div>
                        <div className="flex flex-col min-w-fit">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider whitespace-nowrap">Objetivo</span>
                            <span className="text-sm font-bold text-gray-700">
                                {formatValue(goal.valor_alvo)}
                            </span>
                        </div>
                    </div>

                    {/* Container de Botões */}
                    <div className="flex items-center gap-2 ml-auto">
                        {/* Botões Secundários: Visíveis no Mobile via toque ou sempre no Desktop */}
                        <div className="flex items-center gap-1 sm:gap-2 mr-1">
                            <button
                                onClick={() => onDelete(goal.id)}
                                className="p-2 text-gray-300 hover:text-red-500 transition-colors text-[9px] font-bold uppercase tracking-tighter"
                            >
                                Excluir
                            </button>
                            <button
                                onClick={() => onEdit(goal)}
                                className="p-2 text-gray-300 hover:text-gray-600 transition-colors text-[9px] font-bold uppercase tracking-tighter"
                            >
                                Editar
                            </button>
                        </div>

                        {/* Botão de Aporte: Protegido contra quebra */}
                        <button
                            onClick={() => onAddProgress(goal)}
                            className="bg-gray-900 text-white text-[10px] font-black px-5 py-3 rounded-xl hover:bg-green-600 transition-all uppercase tracking-widest shadow-sm active:scale-95 whitespace-nowrap flex-shrink-0"
                        >
                            + Aporte
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}