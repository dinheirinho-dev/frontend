"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'
import Logo from '../components/Logo';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CadastroPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [nome, setNome] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensagem('');
        setLoading(true);

        try {
            const data = {
                nome: nome,
                email: email,
                senha: senha,
            };

            const response = await axios.post(`${API_URL}/users/`, data);

            // Sucesso! Tenta logar automaticamente ou redireciona
            setMensagem('🎉 Cadastro realizado com sucesso! Redirecionando para o Login...');

            // Redirecionar para a tela de login para que o usuário insira as credenciais
            setTimeout(() => {
                router.push('/login');
            }, 1500);

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // Captura o erro 400 do FastAPI ("Email já cadastrado")
                setMensagem('Erro: ' + error.response.data.detail);
            } else {
                setMensagem('Erro de conexão ao tentar cadastrar.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                <Logo /> {/* Logo com a vibe Duolingo */}

                <h2 className="text-xl font-bold text-center text-gray-700">Comece a fazer seu Dinheirinho crescer!</h2>

                <form className="space-y-4" onSubmit={handleCadastro}>

                    {/* Campo Nome */}
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                        <input id="nome" type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>

                    {/* Campo E-mail */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
                        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>

                    {/* Campo Senha */}
                    <div>
                        <label htmlFor="senha" className="block text-sm font-medium text-gray-700">Senha</label>
                        <input id="senha" type="password" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">
                        {loading ? 'Cadastrando...' : 'Criar Conta'}
                    </button>

                </form>

                {mensagem && (
                    <p className={`text-center text-sm font-medium ${mensagem.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                        {mensagem}
                    </p>
                )}

                {/* Link para Login */}
                <p className="text-center text-sm text-gray-600">
                    Já tem uma conta? <button onClick={() => router.push('/login')} className="text-green-600 hover:text-green-700 font-medium">Entrar</button>
                </p>

            </div>
        </div>
    );
}