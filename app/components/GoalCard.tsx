import React from 'react';
import { Goal } from '../../src/types';
import { maskedValue } from '../../src/utils/formatMoney';
import { Pencil, Trash2 } from 'lucide-react';

interface GoalCardProps {
    goal: Goal;
    showValues: boolean;
    onEdit: (goal: Goal) => void;
    onDelete: (goalId: string) => void;
    onAddProgress: (goal: Goal) => void;
}

export default function GoalCard({ goal, showValues, onEdit, onDelete, onAddProgress }: GoalCardProps) {
    const progress = Math.min((goal.valor_atual / goal.valor_alvo) * 100, 100);
    const dueDate = new Date(goal.data_limite).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const isConcluida = goal.status === 'CONCLUIDA' || progress >= 100;

    return (
        <div className="bg-white dark:bg-gray-800 p-2.5 md:p-5 rounded-xl md:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group w-full max-w-full">
            {/* Indicador de Status lateral */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isConcluida ? 'bg-emerald-500' : 'bg-green-600'}`} />

            <div className="flex flex-col gap-2 md:gap-4 pl-2">

                {/* Header: Título, Badge e Porcentagem */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs md:text-base font-bold text-gray-800 dark:text-gray-100 leading-tight wrap-break-word">{goal.descricao}</h3>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${isConcluida ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400'}`}>
                                {isConcluida ? 'Concluída' : 'Em Foco'}
                            </span>
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold">Prazo: {dueDate}</span>
                        </div>
                    </div>
                    <span className="text-lg md:text-2xl font-black text-gray-900 dark:text-gray-100 leading-none shrink-0">{progress.toFixed(0)}%</span>
                </div>

                {/* Barra de Progresso */}
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isConcluida ? 'bg-emerald-500' : 'bg-green-600'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Valores e Ações */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-3 min-w-0">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wide">Acum.</span>
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 truncate">
                                {maskedValue(goal.valor_atual, showValues)}
                            </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wide">Objetivo</span>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                                {maskedValue(goal.valor_alvo, showValues)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => onDelete(goal.id)}
                            aria-label={`Excluir meta ${goal.descricao}`}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onEdit(goal)}
                            aria-label={`Editar meta ${goal.descricao}`}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onAddProgress(goal)}
                            disabled={isConcluida}
                            aria-label={`Adicionar aporte na meta ${goal.descricao}`}
                            className="bg-gray-900 dark:bg-gray-700 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg hover:bg-green-600 dark:hover:bg-green-600 transition-all shadow-sm active:scale-95 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            + Aporte
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
