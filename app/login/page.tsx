"use client";

import Link from "next/link";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import React from 'react';

// Importamos a sua instância configurada
import api from '../../src/services/api';
import Logo from '../components/Logo';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // O FastAPI (OAuth2) espera os dados em formato Form Data
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', senha);

            // Usamos o axios diretamente aqui para o login, pois ainda não temos o token
            // Mas usamos a baseURL que já definimos na nossa api
            const response = await api.post('/token', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });

            // 1. Capturamos o token JWT
            const token = response.data.access_token;

            // 2. Salvamos no localStorage para uso dos interceptors
            localStorage.setItem('dinheirinho_token', token);

            // 3. Atualizamos a instância da API para as próximas chamadas nesta mesma sessão
            api.defaults.headers.Authorization = `Bearer ${token}`;

            setMensagem('🎉 Login efetuado com sucesso! Redirecionando...');

            // Redirecionar para o Dashboard
            router.push('/dashboard');

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // Se o backend retornou um erro específico (ex: senha incorreta)
                const erroDetalhe = error.response.data.detail || 'Erro ao realizar login';
                setMensagem('Erro: ' + erroDetalhe);
            } else {
                setMensagem('Erro de conexão com o servidor.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Link
                href="/"
                className="absolute top-10 left-10 text-sm font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-all"
            >
                ← Voltar para a Home
            </Link>

            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                <Logo />
                <h2 className="text-2xl font-bold text-center text-green-600">
                    Dinheirinho: Faça seu Login
                </h2>

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-700"
                        />
                    </div>
                    <div>
                        <label htmlFor="senha" className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                            id="senha"
                            type="password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-700"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Entrar
                    </button>
                </form>

                {mensagem && (
                    <p className={`text-center text-sm font-medium ${mensagem.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                        {mensagem}
                    </p>
                )}

                <p className="text-center text-sm text-gray-600 mt-4">
                    Não tem conta? <button onClick={() => router.push('/cadastro')} className="text-green-600 hover:text-green-700 font-medium">Cadastre-se aqui</button>
                </p>
            </div>
        </div>
    );
}