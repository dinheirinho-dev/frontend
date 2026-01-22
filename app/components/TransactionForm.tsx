"use client";

import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface TransactionFormProps {
    onClose: () => void;
    onTransactionCreated: () => void;
}

// Opções de Categorias para o MVP
const CATEGORIES = [
    'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Educação', 'Saúde', 'Salário', 'Investimento', 'Outros'
];

export default function TransactionForm({ onClose, onTransactionCreated }: TransactionFormProps) {
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [tipo, setTipo] = useState('');
    const [categoria, setCategoria] = useState(CATEGORIES[0]);
    const [loading, setLoading] = useState<boolean>(false);
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
            const data = {
                descricao: descricao,
                valor: parseFloat(valor),
                tipo: tipo,
                categoria: categoria,
            };

            await axios.post(`${API_URL}/transactions/`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            onTransactionCreated();
            onClose();

        } catch (err) {
            setError("Falha ao adicionar lançamento. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-green-700 mb-4">Novo Lançamento ({tipo === 'GASTO' ? 'Gasto' : 'Receita'})</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* TIPO (Gasto/Receita) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="RECEITA">RECEITA (➕)</option>
                            <option value="GASTO">GASTO (➖)</option>
                        </select>
                    </div>

                    {/* DESCRIÇÃO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>

                    {/* VALOR */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                        <input type="number" value={valor} onChange={(e) => setValor(e.target.value)} required min="0.01" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>

                    {/* CATEGORIA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    {/* Botões */}
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300" disabled={loading}>Cancelar</button>
                        <button type="submit" className={`px-4 py-2 text-white font-semibold rounded-lg ${tipo === 'GASTO' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} disabled:bg-gray-400`} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Lançamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}