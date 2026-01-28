"use client";

import { useState } from 'react';
import React from 'react';
import { useAuth } from "@clerk/nextjs";
import api from '../../src/services/api';
import axios from 'axios';

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
            // Usamos a instância 'api' e passamos o x-clerk-id no header
            await api.patch(`/goals/${goalId}/add_progress`, null, {
                params: { amount: parseFloat(amount) },
                headers: {
                    'x-clerk-id': userId
                },
            });

            onProgressAdded();
            onClose();

        } catch (err) {
            console.error("Error adding progress:", err);
            if (axios.isAxiosError(err) && err.response?.status === 401) {
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
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">💰 Adicionar Fundos</h2>
                <p className="text-sm text-gray-600 mb-6 text-center">
                    Alocando dinheiro para: <span className="font-semibold text-gray-800">{goalDescription}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Valor a Alocar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quanto você guardou? (R$)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0,00"
                            required
                            min="0.01"
                            step="0.01"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-700"
                        />
                        <p className="text-xs text-gray-500 mt-2 italic">
                            Esse valor será somado ao progresso que você já tem nessa meta.
                        </p>
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
                            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 shadow-md transition-all"
                            disabled={loading}
                        >
                            {loading ? 'Processando...' : 'Confirmar Depósito'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}