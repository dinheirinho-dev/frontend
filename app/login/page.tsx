"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import React from 'react';

import Logo from '../components/Logo';

// URL base da API FastAPI
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
    // Capturar o e-mail e senha
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const router = useRouter();

    // Lógica de Login
    const handleLogin = async (e: React.FormEvent) => {
        // ESSENCIAL: Evita que o formulário recarregue a página
        e.preventDefault();

        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', senha);

            const response = await axios.post(`${API_URL}/token`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });

            // Se o login for 200 OK:
            const token = response.data.access_token;
            localStorage.setItem('dinheirinho_token', token);

            setMensagem('🎉 Login efetuado com sucesso! Redirecionando...');

            // Redirecionar para o Dashboard
            router.push('/dashboard');

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setMensagem('Erro de login: ' + error.response.data.detail);
            } else {
                setMensagem('Erro de conexão com o servidor.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
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

                {/* Área de Mensagens */}
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