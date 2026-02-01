"use client";

import React from 'react';
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    if (isLoaded && isSignedIn) {
        router.push('/dashboard');
        return null;
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">

            {/* --- Navbar --- */}
            <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-50">
                <div className="flex justify-between items-center px-6 h-20 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-600 p-1.5 rounded-xl shadow-lg shadow-green-600/20">
                            <span className="text-white font-black text-xl italic leading-none">$</span>
                        </div>
                        <span className="text-2xl font-black text-green-700 tracking-tighter">Dinheirinho</span>
                    </div>
                    <SignInButton mode="modal">
                        <button className="text-sm font-bold text-gray-500 hover:text-green-700 transition-colors">Entrar</button>
                    </SignInButton>
                </div>
            </nav>

            {/* --- Hero Section com Gradiente --- */}
            <header className="relative pt-40 pb-20 px-6 overflow-hidden bg-green-50/30">
                <div className="absolute top-20 right-0 -mr-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                <div className="absolute top-40 left-0 -ml-20 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />

                <div className="relative z-10 text-center max-w-4xl mx-auto">

                    {/* --- SELO INTERATIVO COM CHANGELOG (CLICÁVEL & RESPONSIVO) --- */}
                    <div className="relative inline-block mb-10 group">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                // No mobile o clique abre/fecha. No desktop o hover já resolve, mas o clique não atrapalha.
                            }}
                            className="px-6 py-2 text-[12px] md:text-sm font-black uppercase tracking-[0.2em] bg-green-100 text-green-700 rounded-full animate-pulse hover:bg-green-600 hover:text-white hover:animate-none transition-all duration-300 shadow-sm border border-green-200 active:scale-95"
                        >
                            Versão 0.5 Disponível 🚀
                        </button>

                        {/* Balão do Changelog - Visível no Hover (Desktop) e no Foco/Clique (Mobile) */}
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[280px] md:w-[350px] p-6 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.2)] rounded-[32px] border border-gray-100 opacity-0 scale-90 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:translate-y-0 transition-all duration-500 z-[100] text-left">

                            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                                <div className="bg-green-100 p-2 rounded-xl text-xl">📦</div>
                                <div>
                                    <h4 className="text-[12px] md:text-sm font-black text-gray-900 uppercase tracking-tighter">Notas da Versão 0.5</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Atualizado em 01/02</p>
                                </div>
                            </div>

                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                    <p className="text-[12px] md:text-sm leading-snug text-gray-600">
                                        <strong className="text-gray-900">Filtro Mensal:</strong> Agora você visualiza seu saldo e gráficos de forma isolada para cada mês.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                    <p className="text-[12px] md:text-sm leading-snug text-gray-600">
                                        <strong className="text-gray-900">Edição Dinâmica:</strong> Corrija qualquer valor ou categoria instantaneamente com o novo modo de edição.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                    <p className="text-[12px] md:text-sm leading-snug text-gray-600">
                                        <strong className="text-gray-900">Experiência Onboarding:</strong> Novo sistema de boas-vindas para configurar seu saldo inicial em segundos.
                                    </p>
                                </li>
                            </ul>

                            <div className="mt-6 flex items-center justify-center bg-green-50 py-2 rounded-2xl">
                                <span className="text-[11px] md:text-xs font-black text-green-700 animate-bounce">🚀 Bora organizar fevereiro!</span>
                            </div>

                            {/* Setinha do Balão */}
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100"></div>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-8">
                        Faça seu <span className="text-green-600">Dinheirinho</span><br />
                        virar um <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Dinheirão.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                        Controle suas finanças com simplicidade, privacidade total e login social. O jeito mais fácil de ver sua riqueza crescer.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6">
                        <SignInButton mode="modal">
                            <button className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl hover:bg-green-600 hover:-translate-y-1 transition-all duration-300">
                                Começar Agora com Google
                            </button>
                        </SignInButton>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">100% Gratuito e Seguro pelo Clerk</p>
                    </div>
                </div>
            </header>

            {/* --- Restante da Landing Page (Privacidade, Propósito, Cards e Footer) --- */}
            <section className="relative z-20 px-6 -mt-10 mb-24 max-w-7xl mx-auto">
                <div className="bg-gray-900 rounded-[48px] p-8 md:p-16 text-white shadow-3xl overflow-hidden relative flex flex-col lg:flex-row items-center gap-12">
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-green-600/20 rounded-full blur-3xl" />
                    <div className="flex-1 relative z-10 text-center lg:text-left">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Privacidade que te dá liberdade.</h2>
                        <p className="text-gray-400 text-lg font-medium mb-10 leading-relaxed max-w-xl">
                            O exclusivo <strong>Modo Stealth</strong> oculta seus valores com um clique. Gerencie suas finanças em qualquer lugar com total discrição.
                        </p>
                        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl font-mono text-green-400 tracking-[0.3em] mb-8 lg:mb-0">
                            R$ ••••••
                        </div>
                    </div>
                    <div className="flex-1 relative z-10 w-full max-w-[550px]">
                        <div className="bg-white/5 p-2 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl transform lg:rotate-3 hover:rotate-0 transition-transform duration-500">
                            <img src="/dashboard.png" alt="Preview do Dinheirinho" className="rounded-2xl w-full h-auto shadow-inner opacity-95 hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                        Chega de planilhas <span className="text-red-500 italic">confusas.</span>
                    </h2>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed">
                        O Dinheirinho foi criado para quem quer clareza. Nós transformamos seus dados em informação visual, para que você pare de apenas sobreviver ao mês e comece a construir seu patrimônio.
                    </p>
                </div>
            </section>

            <section className="py-12 pb-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:border-green-200 transition-all group">
                        <div className="w-14 h-14 bg-green-50 flex items-center justify-center rounded-2xl text-2xl mb-8 group-hover:scale-110 transition-transform">🎯</div>
                        <h3 className="text-2xl font-black text-gray-800 mb-4">Metas Reais</h3>
                        <p className="text-gray-500 leading-relaxed font-medium">Visualize cada centavo se aproximando do seu sonho. Deixe de apenas guardar e comece a conquistar objetivos reais.</p>
                    </div>
                    <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:border-green-200 transition-all group">
                        <div className="w-14 h-14 bg-green-50 flex items-center justify-center rounded-2xl text-2xl mb-8 group-hover:scale-110 transition-transform">💸</div>
                        <h3 className="text-2xl font-black text-gray-800 mb-4">Fluxo Simples</h3>
                        <p className="text-gray-500 leading-relaxed font-medium">Lance ganhos e gastos em segundos. Tenha um histórico limpo e organizado sem a complexidade de planilhas.</p>
                    </div>
                    <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:border-green-200 transition-all group">
                        <div className="w-14 h-14 bg-green-50 flex items-center justify-center rounded-2xl text-2xl mb-8 group-hover:scale-110 transition-transform">📊</div>
                        <h3 className="text-2xl font-black text-gray-800 mb-4">Visão de águia</h3>
                        <p className="text-gray-500 leading-relaxed font-medium">Gráficos de evolução que mostram exatamente para onde seu dinheiro flui. Decisões inteligentes baseadas em dados.</p>
                    </div>
                </div>
            </section>

            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto bg-gray-900 rounded-[48px] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl border border-white/5">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-600/20 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px]" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                            O seu futuro financeiro<br />
                            começa com um <span className="text-green-500 italic">clique.</span>
                        </h2>
                        <p className="text-gray-400 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                            Junte-se aos novos usuários que já estão saindo das planilhas para a clareza total. 100% gratuito e seguro.
                        </p>
                        <div className="flex flex-col items-center gap-4">
                            <SignInButton mode="modal">
                                <button className="w-full sm:w-auto bg-green-600 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-[0_20px_50px_rgba(22,163,74,0.3)] hover:bg-green-500 hover:-translate-y-1 active:scale-95 transition-all duration-300">
                                    Criar minha conta agora
                                </button>
                            </SignInButton>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-4">Sem cartão de crédito • Login social rápido</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-600 p-1.5 rounded-lg shadow-md">
                            <span className="text-white font-black text-xs italic">$</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800">Dinheirinho</span>
                    </div>
                    <div className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Dinheirinho. Todos os direitos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
}