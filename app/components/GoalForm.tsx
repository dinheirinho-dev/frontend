// components/GoalForm.tsx

"use client";

import { useState, useEffect } from 'react';
import React from 'react';
import { useAuth } from "@clerk/nextjs";
import api from '../../src/services/api';
import axios from 'axios';

// --- Interfaces ---
interface Goal {
    id: string;
    descricao: string;
    valor_alvo: number;
    valor_atual: number;
    data_limite: string;
    owner_id: string;
}

interface GoalFormProps {
    onClose: () => void;
    onGoalCreated: () => void;
    goalToEdit: Goal | null;
}

export default function GoalForm({ onClose, onGoalCreated, goalToEdit }: GoalFormProps) {
    const { userId } = useAuth();

    const [descricao, setDescricao] = useState('');
    const [valorAlvo, setValorAlvo] = useState('');
    const [dataLimite, setDataLimite] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState('');

    const isEditing = !!goalToEdit;

    // Sincroniza o formulário se for edição ou criação
    useEffect(() => {
        if (goalToEdit) {
            setDescricao(goalToEdit.descricao);
            setValorAlvo(String(goalToEdit.valor_alvo));
            setDataLimite(goalToEdit.data_limite);
        } else {
            setDescricao('');
            setValorAlvo('');
            setDataLimite('');
        }
    }, [goalToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            setError("Usuário não identificado. Aguarde um momento.");
            return;
        }

        setError('');
        setLoading(true);

        try {
            const data = {
                descricao: descricao,
                valor_alvo: parseFloat(valorAlvo),
                data_limite: dataLimite,
            };

            const headers = { 'x-clerk-id': userId };

            if (isEditing && goalToEdit) {
                // Lógica de Edição (PUT)
                await api.put(`/goals/${goalToEdit.id}`, data, { headers });
            } else {
                // Lógica de Criação (POST)
                await api.post('/goals/', data, { headers });
            }

            onGoalCreated();
            onClose();

        } catch (err) {
            console.error("Error saving goal:", err);
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setError("Sessão expirada. Refaça o login.");
            } else {
                setError(`Falha ao ${isEditing ? 'editar' : 'criar'} meta. Tente novamente.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">

                <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">
                    {isEditing ? '✏️ Editar Meta' : '🎯 Nova Meta'}
                </h2>

                <p className="text-sm text-gray-600 mb-6 text-center">
                    {isEditing ? 'Ajuste os detalhes do seu objetivo.' : 'Planeje sua próxima conquista financeira!'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">O que você quer conquistar?</label>
                        <input
                            type="text"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Ex: Reserva de Emergência"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-700"
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
                            placeholder="0,00"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                        />
                    </div>

                    {/* Data Limite */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Até quando? (Prazo)</label>
                        <input
                            type="date"
                            value={dataLimite}
                            onChange={(e) => setDataLimite(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

                    {/* Botões */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 font-semibold disabled:bg-gray-400 shadow-md transition-all"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Meta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}