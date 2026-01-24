import React from 'react';

// Interfaces (baseados no schemas.py)
interface Goal {
    id: string;
    descricao: string;
    valor_alvo: number;
    valor_atual: number;
    data_limite: string; // Vem como string no formato YYYY-MM-DD
    owner_id: string;
}

interface GoalCardProps {
    goal: Goal;
    onEdit: (goal: Goal) => void;
    onDelete: (goalId: string) => void;
    onAddProgress: (goal: Goal) => void; // A função de progresso deve receber a meta inteira
}

export default function GoalCard({ goal, onEdit, onDelete, onAddProgress }: GoalCardProps) {

    // Cálculo do Progresso e Estilo
    const progress = Math.min((goal.valor_atual / goal.valor_alvo) * 100, 100);
    const progressColor = progress >= 100 ? 'bg-green-500' : 'bg-yellow-500';
    const progressText = progress >= 100 ? 'Meta Atingida!' : `${progress.toFixed(1)}%`;
    const progressTip = progress >= 100 ? 'Parabéns!' : 'Continue a econimizar!';

    // Formatação da data
    const dueDate = new Date(goal.data_limite).toLocaleDateString('pt-BR');

    return (
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl hover:scale-[1.01]">

            {/* Título e Status */}
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-800">{goal.descricao}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${progress >= 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {progress >= 100 ? 'Concluída' : 'Em Progresso'}
                </span>
            </div>

            {/* Valores */}
            <div className="text-sm text-gray-600 mb-2">
                <p>Alvo: <span className="font-semibold text-green-600">R$ {goal.valor_alvo.toFixed(2)}</span></p>
                <p>Atual: <span className="font-semibold">R$ {goal.valor_atual.toFixed(2)}</span></p>
            </div>

            {/* Barra de Progresso - O toque de Gamificação */}
            <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                    <div
                        className={`h-2.5 rounded-full ${progressColor}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>{progressText}</span>
                    <span>Prazo: {dueDate}</span>
                </div>
            </div>

            {/* NOVOS BOTÕES DE AÇÃO */}
            <div className="flex justify-end space-x-2 mt-4 border-t pt-3">

                {/* Botão para adicionar progresso/lançamento à meta */}
                <button
                    onClick={() => onAddProgress(goal)}
                    className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full hover:bg-green-200 transition"
                >
                    + Progresso
                </button>

                {/* Botão de Edição */}
                <button
                    onClick={() => onEdit(goal)}
                    className="text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full hover:bg-blue-200 transition"
                >
                    Editar
                </button>

                {/* Botão de Exclusão */}
                <button
                    onClick={() => onDelete(goal.id)}
                    className="text-xs font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full hover:bg-red-200 transition"
                >
                    Excluir
                </button>
            </div>
        </div>
    );
}