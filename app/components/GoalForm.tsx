"use client";

import { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import { Target, Pencil } from 'lucide-react';
import api from '../../src/services/api';
import axios from 'axios';
import { Goal } from '../../src/types';
import { formatInputToBRL, parseBRLToNumber } from '../../src/utils/formatMoney';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!goalToEdit;

    useEffect(() => {
        if (goalToEdit) {
            setDescricao(goalToEdit.descricao);
            setValorAlvo(formatInputToBRL(String(Math.round(goalToEdit.valor_alvo * 100))));
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
                descricao,
                valor_alvo: parseBRLToNumber(valorAlvo),
                data_limite: dataLimite,
            };

            const headers = { 'x-clerk-id': userId };

            if (isEditing && goalToEdit) {
                await api.put(`/goals/${goalToEdit.id}`, data, { headers });
            } else {
                await api.post('/goals/', data, { headers });
            }

            onGoalCreated();
            onClose();

        } catch (err) {
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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-green-600">

                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1 text-center">
                    <span className="flex items-center justify-center gap-2">
                        {isEditing ? <Pencil className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                        {isEditing ? 'Editar Meta' : 'Nova Meta'}
                    </span>
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
                    {isEditing ? 'Ajuste os detalhes do seu objetivo.' : 'Planeje sua próxima conquista financeira!'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">O que você quer conquistar?</label>
                        <input
                            type="text"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Ex: Reserva de Emergência"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none text-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Alvo</label>
                        <input
                            type="text"
                            value={valorAlvo}
                            onChange={(e) => setValorAlvo(formatInputToBRL(e.target.value))}
                            placeholder="R$ 0,00"
                            required
                            className="mt-1 block w-full px-3 py-2 border-2 border-green-100 dark:border-green-800 focus:border-green-500 dark:bg-gray-700 rounded-md text-xl font-bold text-green-600 dark:text-green-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Até quando? (Prazo)</label>
                        <input
                            type="date"
                            value={dataLimite}
                            onChange={(e) => setDataLimite(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-gray-700 outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-white bg-green-600 hover:bg-green-700 font-bold rounded-lg shadow-sm disabled:bg-gray-400 transition-all active:scale-95"
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
