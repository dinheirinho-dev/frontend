"use client";

import { useState } from 'react';
import React from 'react';
// 1. Trocamos o axios puro pela nossa instância configurada
import api from '../../src/services/api';
import axios from 'axios';

interface TransactionFormProps {
    onClose: () => void;
    onTransactionCreated: () => void;
}

const CATEGORIES = [
    'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Educação', 'Saúde', 'Salário', 'Investimento', 'Outros'
];

export default function TransactionForm({ onClose, onTransactionCreated }: TransactionFormProps) {
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [tipo, setTipo] = useState('RECEITA');
    const [categoria, setCategoria] = useState(CATEGORIES[0]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = {
                descricao: descricao,
                valor: parseFloat(valor),
                tipo: tipo,
                categoria: categoria,
            };

            // 2. Agora chamamos apenas api.post. 
            // O interceptor injeta o Token automaticamente!
            await api.post('/transactions/', data);

            onTransactionCreated();
            onClose();

        } catch (err) {
            // Tratamento de erro mais específico
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setError("Sessão expirada. Faça login novamente.");
            } else {
                setError("Falha ao adicionar lançamento. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">
                    Novo Lançamento ({tipo === 'GASTO' ? 'Gasto' : 'Receita'})
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* TIPO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-700"
                        >
                            <option value="RECEITA">RECEITA (➕)</option>
                            <option value="GASTO">GASTO (➖)</option>
                        </select>
                    </div>

                    {/* CATEGORIA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* VALOR */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                        <input
                            type="number"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                        />
                    </div>

                    {/* DESCRIÇÃO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input
                            type="text"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Ex: Aluguel ou Salário"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

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
                            className={`px-4 py-2 text-white font-semibold rounded-lg transition-all ${tipo === 'GASTO' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                } disabled:bg-gray-400 shadow-md`}
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar Lançamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}