"use client";

import { useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import api from '../../src/services/api';
import axios from 'axios';
import { formatInputToBRL, parseBRLToNumber } from '../../src/utils/formatMoney';

interface GoalProgressFormProps {
    onClose: () => void;
    onProgressAdded: () => void;
    goalId: string;
    goalDescription: string;
}

export default function GoalProgressForm({ onClose, onProgressAdded, goalId, goalDescription }: GoalProgressFormProps) {
    const { userId } = useAuth();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            setError("Usuário não identificado.");
            return;
        }

        setError('');
        setLoading(true);

        try {
            await api.patch(`/goals/${goalId}/add_progress`, null, {
                params: { amount: parseBRLToNumber(amount) },
                headers: { 'x-clerk-id': userId },
            });

            onProgressAdded();
            onClose();

        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (axios.isAxiosError(err) && err.response?.status === 401) {
                setError("Sessão expirada. Refaça o login.");
            } else {
                setError("Falha ao adicionar progresso. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-green-600">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1 text-center">💰 Adicionar Aporte</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
                    Meta: <span className="font-semibold text-gray-800 dark:text-gray-200">{goalDescription}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quanto você guardou?</label>
                        <input
                            type="text"
                            value={amount}
                            onChange={(e) => setAmount(formatInputToBRL(e.target.value))}
                            placeholder="R$ 0,00"
                            required
                            autoFocus
                            className="mt-1 block w-full px-3 py-2 border-2 border-green-100 dark:border-green-800 focus:border-green-500 dark:bg-gray-700 rounded-md text-xl font-bold text-green-600 dark:text-green-400 outline-none"
                        />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            Esse valor será somado ao progresso atual da meta.
                        </p>
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
                            className="px-6 py-2 text-white bg-green-600 hover:bg-green-700 font-bold rounded-lg shadow-lg shadow-green-200 disabled:bg-gray-400 transition-all active:scale-95"
                            disabled={loading}
                        >
                            {loading ? 'Processando...' : 'Confirmar Aporte'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
