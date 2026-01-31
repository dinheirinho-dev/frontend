"use client";

import { useState, useEffect } from 'react';
import React from 'react';
import { useAuth } from "@clerk/nextjs";
import api from '../../src/services/api';
import axios from 'axios';

interface TransactionFormProps {
    onClose: () => void;
    onTransactionCreated: () => void;
    transactionToEdit?: any; // Nova prop para edição
}

const CATEGORIES = [
    'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Educação', 'Saúde', 'Salário', 'Investimento', 'Outros'
];

export default function TransactionForm({ onClose, onTransactionCreated, transactionToEdit }: TransactionFormProps) {
    const { userId } = useAuth();

    const [descricao, setDescricao] = useState(transactionToEdit?.descricao || '');
    const [valor, setValor] = useState('');
    const [tipo, setTipo] = useState(transactionToEdit?.tipo || 'RECEITA');
    const [categoria, setCategoria] = useState(transactionToEdit?.categoria || CATEGORIES[0]);
    const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState('');

    const formatToBRL = (value: string) => {
        const cleanValue = value.replace(/\D/g, "");
        const options = { minimumFractionDigits: 2 };
        const result = (Number(cleanValue) / 100).toLocaleString("pt-BR", options);
        return `R$ ${result}`;
    };

    // Efeito para carregar e formatar o valor inicial caso seja edição
    useEffect(() => {
        if (transactionToEdit) {
            // Multiplicamos por 100 para o formatToBRL processar os centavos corretamente
            const valueAsStr = (transactionToEdit.valor * 100).toFixed(0);
            setValor(formatToBRL(valueAsStr));
        }
    }, [transactionToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            setError("Identificando usuário... tente novamente.");
            return;
        }

        setError('');
        setLoading(true);

        const numericAmount = parseFloat(valor.replace(/[^\d]/g, "")) / 100;

        try {
            const data = {
                descricao: descricao,
                valor: numericAmount,
                tipo: tipo,
                categoria: categoria,
                date: date
            };

            if (transactionToEdit) {
                // MODO EDIÇÃO: Chama o PUT
                await api.put(`/transactions/${transactionToEdit.id}`, data, {
                    headers: { 'x-clerk-id': userId }
                });
            } else {
                // MODO CRIAÇÃO: Chama o POST
                await api.post('/transactions/', data, {
                    headers: { 'x-clerk-id': userId }
                });
            }

            onTransactionCreated();
            onClose();

        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setError("Sessão inválida. Verifique seu login.");
            } else {
                setError("Falha ao salvar lançamento. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">
                    {transactionToEdit ? 'Editar Lançamento' : `Novo Lançamento (${tipo === 'GASTO' ? 'Gasto' : 'Receita'})`}
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

                    {/* DATA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-700 shadow-sm transition-all"
                        />
                    </div>

                    {/* VALOR */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                        <input
                            type="text"
                            value={valor}
                            onChange={(e) => setValor(formatToBRL(e.target.value))}
                            placeholder="R$ 0,00"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-green-500 focus:border-green-500"
                        />
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

                    {/* DESCRIÇÃO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input
                            type="text"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Ex: Aluguel ou Salário"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-700 shadow-sm transition-all"
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
                            {loading ? 'Salvando...' : transactionToEdit ? 'Salvar Alterações' : 'Salvar Lançamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}