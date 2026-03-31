"use client";

import { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import api from '../../src/services/api';
import axios from 'axios';
import { Transaction, TipoTransacao } from '../../src/types';
import { formatInputToBRL, parseBRLToNumber } from '../../src/utils/formatMoney';

interface TransactionFormProps {
    onClose: () => void;
    onTransactionCreated: () => void;
    transactionToEdit?: Transaction;
}

const CATEGORIES = [
    'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Educação', 'Saúde', 'Salário', 'Investimento', 'Metas', 'Outros'
];

export default function TransactionForm({ onClose, onTransactionCreated, transactionToEdit }: TransactionFormProps) {
    const { userId } = useAuth();

    const [descricao, setDescricao] = useState(transactionToEdit?.descricao || '');
    const [valor, setValor] = useState('');
    const [tipo, setTipo] = useState<TipoTransacao>(transactionToEdit?.tipo || 'RECEITA');
    const [categoria, setCategoria] = useState(transactionToEdit?.categoria || CATEGORIES[0]);
    const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
    const [recorrente, setRecorrente] = useState(transactionToEdit?.recorrente ?? false);
    const [periodicidade, setPeriodicidade] = useState<'mensal' | 'semanal'>(
        (transactionToEdit?.periodicidade as 'mensal' | 'semanal') || 'mensal'
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (transactionToEdit) {
            const valueAsStr = (transactionToEdit.valor * 100).toFixed(0);
            setValor(formatInputToBRL(valueAsStr));
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

        const numericAmount = parseBRLToNumber(valor);

        try {
            const data = {
                descricao,
                valor: numericAmount,
                tipo,
                categoria,
                date,
                recorrente,
                periodicidade: recorrente ? periodicidade : null,
            };

            if (transactionToEdit) {
                await api.put(`/transactions/${transactionToEdit.id}`, data, {
                    headers: { 'x-clerk-id': userId }
                });
            } else {
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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border-t-8 transition-all duration-300"
                style={{ borderColor: tipo === 'GASTO' ? '#ef4444' : '#22c55e' }}>

                <h2 className={`text-2xl font-bold mb-6 text-center transition-colors duration-300 ${tipo === 'GASTO' ? 'text-red-600' : 'text-green-700 dark:text-green-400'}`}>
                    {transactionToEdit ? 'Editar Lançamento' : `Nov${tipo === 'GASTO' ? 'o Gasto' : 'a Receita'}`}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Tipo GASTO / RECEITA */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-6">
                        <button
                            type="button"
                            onClick={() => setTipo('GASTO')}
                            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md font-bold transition-all ${tipo === 'GASTO'
                                ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm scale-100'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 scale-95 opacity-70'
                                }`}
                        >
                            ➖ GASTO
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipo('RECEITA')}
                            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md font-bold transition-all ${tipo === 'RECEITA'
                                ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm scale-100'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 scale-95 opacity-70'
                                }`}
                        >
                            ➕ RECEITA
                        </button>
                    </div>

                    {/* DATA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-gray-200 outline-none text-gray-700"
                        />
                    </div>

                    {/* VALOR */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
                        <input
                            type="text"
                            value={valor}
                            onChange={(e) => setValor(formatInputToBRL(e.target.value))}
                            placeholder="R$ 0,00"
                            required
                            className={`mt-1 block w-full px-3 py-2 border-2 rounded-md text-xl font-bold transition-colors outline-none dark:bg-gray-700 ${tipo === 'GASTO'
                                ? 'border-red-100 focus:border-red-500 text-red-600'
                                : 'border-green-100 focus:border-green-500 text-green-600'
                                }`}
                        />
                    </div>

                    {/* CATEGORIA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-gray-700 outline-none focus:ring-2 focus:ring-gray-200"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* DESCRIÇÃO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                        <input
                            type="text"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Ex: Aluguel ou Salário"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-gray-200 outline-none text-gray-700 shadow-sm"
                        />
                    </div>

                    {/* RECORRENTE */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Lançamento recorrente?</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Repetir automaticamente todo mês</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setRecorrente(!recorrente)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${recorrente ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${recorrente ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* PERIODICIDADE (só aparece quando recorrente = true) */}
                    {recorrente && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Periodicidade</label>
                            <select
                                value={periodicidade}
                                onChange={(e) => setPeriodicidade(e.target.value as 'mensal' | 'semanal')}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-gray-700 outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="mensal">Mensal</option>
                                <option value="semanal">Semanal</option>
                            </select>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

                    <div className="flex justify-end space-x-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`px-6 py-2 text-white font-bold rounded-lg transition-all transform active:scale-95 ${tipo === 'GASTO'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-green-600 hover:bg-green-700'
                                } disabled:bg-gray-400 shadow-sm`}
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
