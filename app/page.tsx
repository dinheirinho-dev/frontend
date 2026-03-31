"use client";

import React, { useEffect } from 'react';
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import {
    Package, Rocket, Target, ArrowLeftRight, BarChart2,
    EyeOff, TrendingUp, Calculator, Check, X, Crown, Lock
} from 'lucide-react';

// ─── Dados dos planos (espelho do PricingModal) ────────────────────────────────
const PLANS = [
    {
        tier: 'FREE',
        name: 'Gratuito',
        price: 'R$ 0',
        period: 'para sempre',
        highlight: false,
        cta: 'Começar Grátis',
        afterSignIn: '/dashboard',
        features: ['Até 50 lançamentos/mês', 'Dashboard básico', '2 metas ativas'],
        locked: ['Relatórios avançados', 'Recorrentes automáticos', 'Exportação CSV', 'Metas ilimitadas'],
    },
    {
        tier: 'MONTHLY',
        name: 'PRO Mensal',
        price: 'R$ 14,90',
        period: '/mês',
        highlight: false,
        cta: 'Assinar Mensal',
        afterSignIn: '/checkout?tier=MONTHLY',
        features: ['Lançamentos ilimitados', 'Todos os relatórios', 'Recorrentes automáticos', 'Exportação CSV', 'Metas ilimitadas', 'Suporte prioritário'],
    },
    {
        tier: 'ANNUAL',
        name: 'PRO Anual',
        price: 'R$ 99,90',
        period: '/ano',
        highlight: true,
        badge: 'Mais Popular',
        saving: 'Economize R$ 78,90/ano',
        cta: 'Assinar Anual',
        afterSignIn: '/checkout?tier=ANNUAL',
        features: ['Lançamentos ilimitados', 'Todos os relatórios', 'Recorrentes automáticos', 'Exportação CSV', 'Metas ilimitadas', 'Suporte prioritário'],
    },
    {
        tier: 'LIFETIME',
        name: 'Vitalício Founder',
        price: 'R$ 197,00',
        period: 'único',
        highlight: false,
        badge: '25 Vagas',
        cta: 'Assinar Vitalício',
        afterSignIn: '/checkout?tier=LIFETIME',
        features: ['Tudo do PRO', 'Acesso vitalício', 'Futuras funções inclusas', 'Badge de Fundador'],
    },
] as const;

// ─── Logo reutilizável ────────────────────────────────────────────────────────
function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const iconSize = size === 'lg' ? 'w-10 h-10' : size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
    const textSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl';
    const svgSize  = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    return (
        <div className="flex items-center gap-2">
            <div className={`${iconSize} rounded-xl flex items-center justify-center shrink-0`} style={{ background: 'linear-gradient(135deg,#6ee7b7 0%,#059669 100%)' }}>
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={svgSize}>
                    <text x="10" y="16" fontFamily="Arial Black, Arial, sans-serif" fontSize="16" fontWeight="900" fill="white" textAnchor="middle">$</text>
                </svg>
            </div>
            <span className={`${textSize} font-black text-green-700 dark:text-green-400 tracking-tighter`}>Dinheirinho</span>
        </div>
    );
}

export default function LandingPage() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.push('/dashboard');
        }
    }, [isLoaded, isSignedIn, router]);

    if (isLoaded && isSignedIn) return null;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans overflow-x-hidden">

            {/* ── Navbar ── */}
            <nav className="fixed w-full top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-green-50 dark:border-gray-800">
                <div className="flex justify-between items-center px-6 h-20 max-w-7xl mx-auto">
                    <Logo />
                    <div className="flex items-center gap-6">
                        <a href="#planos" className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors hidden sm:block">
                            Planos
                        </a>
                        <SignInButton mode="modal">
                            <button className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors">Entrar</button>
                        </SignInButton>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <header className="relative pt-40 pb-20 px-6 overflow-hidden bg-green-50/30 dark:bg-gray-950">
                <div className="absolute top-20 right-0 -mr-20 w-96 h-96 bg-green-200 dark:bg-green-900/40 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-pulse" />
                <div className="absolute top-40 left-0 -ml-20 w-96 h-96 bg-emerald-200 dark:bg-emerald-900/40 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-pulse delay-700" />

                <div className="relative z-10 text-center max-w-4xl mx-auto">

                    {/* Badge changelog */}
                    <div className="relative inline-block mb-10 group overflow-x-clip">
                        <button className="px-6 py-2 text-[12px] md:text-sm font-black uppercase tracking-[0.2em] bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full animate-pulse hover:bg-green-600 hover:text-white hover:animate-none transition-all duration-300 shadow-sm border border-green-200 dark:border-green-800 active:scale-95">
                            v1.0 — Novidades <Rocket className="inline w-3.5 h-3.5 mb-0.5 ml-1" />
                        </button>

                        <div className="hidden sm:block absolute top-14 left-1/2 -translate-x-1/2 w-[280px] md:w-[350px] p-6 bg-white dark:bg-gray-800 shadow-[0_25px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] rounded-[32px] border border-gray-100 dark:border-gray-700 opacity-0 scale-90 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:translate-y-0 transition-all duration-500 z-[100] text-left">
                            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-xl">
                                    <Package className="w-5 h-5 text-green-700 dark:text-green-400" />
                                </div>
                                <div>
                                    <h4 className="text-[12px] md:text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Notas da Versão 1.0</h4>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Lançamento oficial</p>
                                </div>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                    <p className="text-[12px] md:text-sm leading-snug text-gray-600 dark:text-gray-400">
                                        <strong className="text-gray-900 dark:text-gray-100">Checkout Transparente:</strong> Pague com Pix, cartão de crédito ou boleto sem sair do app.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                    <p className="text-[12px] md:text-sm leading-snug text-gray-600 dark:text-gray-400">
                                        <strong className="text-gray-900 dark:text-gray-100">Plano PRO:</strong> Relatórios avançados, metas ilimitadas, recorrentes automáticos e exportação CSV.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                    <p className="text-[12px] md:text-sm leading-snug text-gray-600 dark:text-gray-400">
                                        <strong className="text-gray-900 dark:text-gray-100">Modo Stealth:</strong> Oculte seus valores financeiros com um único clique.
                                    </p>
                                </li>
                            </ul>
                            <div className="mt-6 flex items-center justify-center bg-green-50 dark:bg-green-900/30 py-2 rounded-2xl">
                                <span className="text-[11px] md:text-xs font-black text-green-700 dark:text-green-400 flex items-center gap-1.5">
                                    <Rocket className="w-3.5 h-3.5" /> Bora organizar suas finanças!
                                </span>
                            </div>
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 rotate-45 border-l border-t border-gray-100 dark:border-gray-700" />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[1.05] tracking-tight mb-8">
                        Faça seu <span className="text-green-600 dark:text-green-400">Dinheirinho</span><br />
                        virar um <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Dinheirão.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                        Controle suas finanças com simplicidade, privacidade total e login social. O jeito mais fácil de ver sua riqueza crescer.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6">
                        <SignInButton mode="modal">
                            <button className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-sm hover:bg-green-600 dark:hover:bg-green-500 dark:hover:text-white hover:-translate-y-1 transition-all duration-300">
                                Começar Grátis
                            </button>
                        </SignInButton>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em]">Comece grátis — upgrade quando quiser</p>
                    </div>
                </div>
            </header>

            {/* ── Privacidade / Stealth ── */}
            <section className="relative z-20 px-6 -mt-10 mb-24 max-w-7xl mx-auto">
                <div className="bg-gray-900 rounded-[48px] p-8 md:p-16 text-white shadow-2xl overflow-hidden relative flex flex-col lg:flex-row items-center gap-12">
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

            {/* ── Problema ── */}
            <section className="py-20 bg-white dark:bg-gray-950">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                        Chega de planilhas <span className="text-red-500 italic">confusas.</span>
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        O Dinheirinho foi criado para quem quer clareza. Nós transformamos seus dados em informação visual, para que você pare de apenas sobreviver ao mês e comece a construir seu patrimônio.
                    </p>
                </div>
            </section>

            {/* ── Features (6 cards) ── */}
            <section className="py-12 pb-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: <Target className="w-7 h-7 text-green-600 dark:text-green-400" />, title: 'Metas Reais', desc: 'Visualize cada centavo se aproximando do seu sonho. Deixe de apenas guardar e comece a conquistar objetivos reais.' },
                        { icon: <ArrowLeftRight className="w-7 h-7 text-green-600 dark:text-green-400" />, title: 'Fluxo Simples', desc: 'Lance ganhos e gastos em segundos. Tenha um histórico limpo e organizado sem a complexidade de planilhas.' },
                        { icon: <BarChart2 className="w-7 h-7 text-green-600 dark:text-green-400" />, title: 'Visão de Águia', desc: 'Gráficos de evolução que mostram exatamente para onde seu dinheiro flui. Decisões inteligentes baseadas em dados.' },
                        { icon: <EyeOff className="w-7 h-7 text-green-600 dark:text-green-400" />, title: 'Modo Stealth', desc: 'Oculte todos os seus valores com um clique. Consulte suas finanças em público sem expor nada.' },
                        { icon: <TrendingUp className="w-7 h-7 text-green-600 dark:text-green-400" />, title: 'Relatórios PRO', desc: 'Comparações mês a mês, top categorias de gasto e taxa de poupança. Inteligência financeira real.' },
                        { icon: <Calculator className="w-7 h-7 text-green-600 dark:text-green-400" />, title: 'Simulador de Investimentos', desc: 'Calcule o crescimento do seu patrimônio com juros compostos e veja quanto seu dinheiro pode render.' },
                    ].map(f => (
                        <div key={f.title} className="bg-white dark:bg-gray-800 p-10 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/40 dark:shadow-gray-900/40 hover:shadow-2xl hover:border-green-200 dark:hover:border-green-700 transition-all group">
                            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/30 flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform">
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-4">{f.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Seção de Planos ── */}
            <section id="planos" className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                            Escolha seu plano
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">
                            Comece grátis e faça upgrade quando precisar de mais poder.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PLANS.map(plan => (
                            <div
                                key={plan.tier}
                                className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all ${
                                    plan.highlight
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md shadow-green-900/10'
                                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}
                            >
                                {/* Badge */}
                                {'badge' in plan && (
                                    <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-black px-3 py-1 rounded-full whitespace-nowrap leading-none ${
                                        plan.highlight ? 'bg-green-600 text-white' : 'bg-amber-400 text-amber-900'
                                    }`}>
                                        {plan.badge}
                                    </span>
                                )}

                                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                                    plan.highlight ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                    {plan.name}
                                </p>

                                <div className="mb-1">
                                    <span className={`text-2xl font-black ${plan.highlight ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-100'}`}>
                                        {plan.price}
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{plan.period}</span>
                                </div>

                                {'saving' in plan && (
                                    <p className="text-[11px] font-semibold text-green-600 dark:text-green-400 mb-2">{plan.saving}</p>
                                )}

                                <div className="border-t border-gray-100 dark:border-gray-700 my-3" />

                                <ul className="space-y-1.5 flex-1 mb-5">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="w-2.5 h-2.5" />
                                            </span>
                                            {f}
                                        </li>
                                    ))}
                                    {'locked' in plan && plan.locked?.map(f => (
                                        <li key={f} className="flex items-start gap-2 text-xs text-gray-300 dark:text-gray-600 line-through">
                                            <span className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                                                <X className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500" />
                                            </span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <SignInButton mode="modal" forceRedirectUrl={plan.afterSignIn}>
                                    <button className={`w-full py-2.5 rounded-xl text-sm font-black transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 ${
                                        plan.highlight
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm shadow-green-900/15'
                                            : plan.tier === 'FREE'
                                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                : 'bg-gray-800 dark:bg-gray-600 text-white hover:bg-gray-700 dark:hover:bg-gray-500'
                                    }`}>
                                        {plan.tier !== 'FREE' && <Crown className="w-3.5 h-3.5" />}
                                        {plan.cta}
                                    </button>
                                </SignInButton>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
                        Pagamento seguro via Asaas · SSL 256-bit · Cancele a qualquer momento
                    </p>
                </div>
            </section>

            {/* ── CTA Final ── */}
            <section className="py-24 px-6 dark:bg-gray-950">
                <div className="max-w-5xl mx-auto bg-gray-900 rounded-[48px] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl border border-white/5">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-600/20 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px]" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                            O seu futuro financeiro<br />
                            começa com um <span className="text-green-500 italic">clique.</span>
                        </h2>
                        <p className="text-gray-400 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                            Comece grátis. Evolua quando quiser. Sem cartão de crédito para começar.
                        </p>
                        <div className="flex flex-col items-center gap-4">
                            <SignInButton mode="modal">
                                <button className="w-full sm:w-auto bg-green-600 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-sm hover:bg-green-500 hover:-translate-y-1 active:scale-95 transition-all duration-300">
                                    Criar minha conta agora
                                </button>
                            </SignInButton>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-4">Sem cartão de crédito · Login social rápido</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <Logo size="sm" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} Dinheirinho. Todos os direitos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
}
