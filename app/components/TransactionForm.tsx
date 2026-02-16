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
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md border-t-8 transition-all duration-300"
                style={{ borderColor: tipo === 'GASTO' ? '#ef4444' : '#22c55e' }}>

                <h2 className={`text-2xl font-bold mb-6 text-center transition-colors duration-300 ${tipo === 'GASTO' ? 'text-red-600' : 'text-green-700'
                    }`}>
                    {transactionToEdit ? 'Editar Lançamento' : `Nov${tipo === 'GASTO' ? 'o Gasto' : 'a Receita'}`}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* NOVO SELETOR ESTILO INVESTIDOR10 */}
                    <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                        <button
                            type="button"
                            onClick={() => setTipo('GASTO')}
                            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md font-bold transition-all ${tipo === 'GASTO'
                                ? 'bg-white text-red-600 shadow-sm scale-100'
                                : 'text-gray-500 hover:text-gray-700 scale-95 opacity-70'
                                }`}
                        >
                            ➖ GASTO
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipo('RECEITA')}
                            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md font-bold transition-all ${tipo === 'RECEITA'
                                ? 'bg-white text-green-600 shadow-sm scale-100'
                                : 'text-gray-500 hover:text-gray-700 scale-95 opacity-70'
                                }`}
                        >
                            ➕ RECEITA
                        </button>
                    </div>

                    {/* DATA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200 outline-none text-gray-700"
                        />
                    </div>

                    {/* VALOR */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor</label>
                        <input
                            type="text"
                            value={valor}
                            onChange={(e) => setValor(formatToBRL(e.target.value))}
                            placeholder="R$ 0,00"
                            required
                            className={`mt-1 block w-full px-3 py-2 border-2 rounded-md text-xl font-bold transition-colors outline-none ${tipo === 'GASTO' ? 'border-red-100 focus:border-red-500 text-red-600' : 'border-green-100 focus:border-green-500 text-green-600'
                                }`}
                        />
                    </div>

                    {/* CATEGORIA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 outline-none focus:ring-2 focus:ring-gray-200"
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200 outline-none text-gray-700 shadow-sm"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

                    <div className="flex justify-end space-x-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`px-6 py-2 text-white font-bold rounded-lg transition-all transform active:scale-95 ${tipo === 'GASTO'
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                } disabled:bg-gray-400 shadow-lg`}
                            disabled={loading}
                        >
                            {loading ? 'Processando...' : transactionToEdit ? 'Atualizar' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}