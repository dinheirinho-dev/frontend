// components/GoalForm.tsx

"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import React from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Interfaces (Devem corresponder ao models/schemas do backend) ---
interface Goal {
    id: number;
    descricao: string;
    valor_alvo: number;
    valor_atual: number;
    data_limite: string; // Formato YYYY-MM-DD
    owner_id: number;
}

interface GoalFormProps {
    onClose: () => void;
    onGoalCreated: () => void; // Função para recarregar as metas no Dashboard
    goalToEdit: Goal | null; // Novo: Meta existente para edição (ou null para criação)
}

export default function GoalForm({ onClose, onGoalCreated, goalToEdit }: GoalFormProps) {
    const [descricao, setDescricao] = useState('');
    const [valorAlvo, setValorAlvo] = useState('');
    const [dataLimite, setDataLimite] = useState('');
    const [loading, setLoading] = useState<boolean>(false); // Tipagem corrigida
    const [error, setError] = useState('');

    // 💥 1. Inicializar o Formulário para Edição
    useEffect(() => {
        if (goalToEdit) {
            setDescricao(goalToEdit.descricao);
            setValorAlvo(String(goalToEdit.valor_alvo));
            // O valor_atual não é editável neste formulário, mas sim o alvo.
            setDataLimite(goalToEdit.data_limite);
        } else {
            // Limpa o formulário se estivermos criando uma nova meta
            setDescricao('');
            setValorAlvo('');
            setDataLimite('');
        }
    }, [goalToEdit]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = localStorage.getItem('dinheirinho_token');
        if (!token) {
            setError("Usuário não autenticado. Por favor, faça login novamente.");
            setLoading(false);
            return;
        }

        try {
            // Cria o objeto de requisição (não enviamos valor_atual, pois o backend cuida disso)
            const data = {
                descricao: descricao,
                valor_alvo: parseFloat(valorAlvo),
                data_limite: dataLimite,
            };

            // 💥 2. Lógica POST (Criação) vs PUT (Edição)
            const isEditing = !!goalToEdit;
            const endpoint = isEditing
                ? `${API_URL}/goals/${goalToEdit!.id}`
                : `${API_URL}/goals/`;

            const method = isEditing ? axios.put : axios.post;

            await method(endpoint, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Sucesso: Recarrega a lista de metas no Dashboard e fecha o modal
            onGoalCreated();
            onClose();

        } catch (err) {
            console.error("Error creating/editing goal:", err);
            // Melhora a mensagem de erro para o usuário
            setError(`Falha ao ${goalToEdit ? 'editar' : 'criar'} meta. Verifique os dados.`);
        } finally {
            setLoading(false);
        }
    };

    const isEditing = !!goalToEdit;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">

                {/* 💥 4. Título Dinâmico */}
                <h2 className="text-2xl font-bold text-green-700 mb-4">
                    {isEditing ? 'Editar Meta' : 'Definir Nova Meta'}
                </h2>

                <p className="text-sm text-gray-600 mb-4">
                    {isEditing ? 'Atualize os dados da sua meta.' : 'Construa sua Pilha Crescente!'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input
                            type="text"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Valor Alvo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor Alvo (R$)</label>
                        <input
                            type="number"
                            value={valorAlvo}
                            onChange={(e) => setValorAlvo(e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Data Limite */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data Limite</label>
                        <input
                            type="date"
                            value={dataLimite}
                            onChange={(e) => setDataLimite(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Mensagens de Erro */}
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    {/* Botões */}
                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                            disabled={loading}
                        >
                            Cancelar
                        </button>

                        {/* 💥 4. Texto do Botão Dinâmico */}
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 font-semibold disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : isEditing ? 'Salvar Edição' : 'Criar Meta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}