"use client";

import { useState } from 'react';
import axios from 'axios';
import React from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface GoalProgressFormProps {
    onClose: () => void;
    onProgressAdded: () => void; // Função para recarregar o Dashboard
    goalId: string; // ID da meta que será atualizada
    goalDescription: string; // Descrição da meta para o título do modal
}

export default function GoalProgressForm({ onClose, onProgressAdded, goalId, goalDescription }: GoalProgressFormProps) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = localStorage.getItem('dinheirinho_token');
        if (!token) {
            setError("Usuário não autenticado. Faça login novamente.");
            setLoading(false);
            return;
        }

        try {
            await axios.patch(`${API_URL}/goals/${goalId}/add_progress`, null, { // O CORPO (null) É VAZIO
                params: { amount: parseFloat(amount) }, // <--- NOVO: Parâmetro de Consulta
                headers: { Authorization: `Bearer ${token}` },
            });

            onProgressAdded();
            onClose();

        } catch (err) {
            setError("Falha ao adicionar progresso. Verifique o valor e tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-green-700 mb-4">Adicionar Progresso</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Alocando fundos para: <span className="font-semibold text-gray-800">{goalDescription}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Valor a Alocar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor a Alocar (R$)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-1">Este valor será adicionado ao seu progresso atual.</p>
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    {/* Botões */}
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300" disabled={loading}>Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 font-semibold disabled:bg-gray-400" disabled={loading}>
                            {loading ? 'Salvando...' : 'Adicionar Fundos'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}