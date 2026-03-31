'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, ChevronDown, Check, X } from 'lucide-react';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PLANS = [
    {
        tier: 'FREE',
        name: 'Gratuito',
        price: 'R$ 0',
        period: 'para sempre',
        highlight: false,
        cta: 'Continuar Grátis',
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
        features: ['Tudo do PRO', 'Acesso vitalício', 'Futuras funções inclusas', 'Badge de Fundador'],
    },
] as const;

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const router = useRouter();
    // Controla qual card está expandido no mobile
    const [expanded, setExpanded] = useState<string | null>('ANNUAL');

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubscribe = (tier: string) => {
        if (tier === 'FREE') { onClose(); return; }
        onClose();
        router.push(`/checkout?tier=${tier}`);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center px-3 py-4 sm:py-6 bg-black/70 backdrop-blur-sm overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl my-auto overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 px-5 pt-7 pb-7 text-center">
                    <button
                        onClick={onClose}
                        aria-label="Fechar"
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors text-sm font-bold"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="mb-2 flex justify-center"><Crown className="w-8 h-8 text-white" /></div>
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug max-w-sm mx-auto">
                        Dinheirinho PRO: Desbloqueie todo o seu potencial financeiro
                    </h2>
                    <p className="text-green-100 text-xs sm:text-sm mt-1.5">Escolha o plano ideal para você</p>
                </div>

                {/* ── DESKTOP: grade horizontal (≥ 640px) ── */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 pt-8">
                    {PLANS.map(plan => (
                        <PlanCard key={plan.tier} plan={plan} onSubscribe={handleSubscribe} />
                    ))}
                </div>

                {/* ── MOBILE: lista vertical (< 640px) ── */}
                <div className="sm:hidden flex flex-col gap-3 p-4 pt-6 w-full max-w-full overflow-hidden">
                    {PLANS.map(plan => {
                        const isOpen = expanded === plan.tier;
                        return (
                            <div
                                key={plan.tier}
                                className={`relative rounded-2xl border-2 overflow-hidden transition-all w-full ${
                                    plan.highlight
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}
                            >
                                {/* Badge mobile */}
                                {'badge' in plan && (
                                    <div className={`text-[11px] font-black text-center py-1 ${
                                        plan.highlight ? 'bg-green-600 text-white' : 'bg-amber-400 text-amber-900'
                                    }`}>
                                        {plan.badge}
                                    </div>
                                )}

                                {/* Cabeçalho do card (sempre visível) */}
                                <button
                                    type="button"
                                    onClick={() => setExpanded(isOpen ? null : plan.tier)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                                >
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${
                                            plan.highlight ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                                        }`}>
                                            {plan.name}
                                        </p>
                                        <div className="flex items-baseline gap-1 mt-0.5">
                                            <span className={`text-xl font-black ${
                                                plan.highlight ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-100'
                                            }`}>
                                                {plan.price}
                                            </span>
                                            <span className="text-xs text-gray-400">{plan.period}</span>
                                        </div>
                                        {'saving' in plan && (
                                            <p className="text-[11px] font-semibold text-green-600 dark:text-green-400 mt-0.5">{plan.saving}</p>
                                        )}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Conteúdo expansível com animação */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[360px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-4 pb-4">
                                        <div className="border-t border-gray-100 dark:border-gray-700 mb-3" />
                                        <ul className="space-y-2 mb-4">
                                            {plan.features.map(f => (
                                                <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                    <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-2.5 h-2.5" /></span>
                                                    {f}
                                                </li>
                                            ))}
                                            {'locked' in plan && plan.locked?.map(f => (
                                                <li key={f} className="flex items-start gap-2 text-xs text-gray-300 dark:text-gray-600 line-through">
                                                    <span className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5"><X className="w-2.5 h-2.5 text-gray-400" /></span>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={() => handleSubscribe(plan.tier)}
                                            className={`w-full py-3 rounded-xl text-sm font-black transition-all active:scale-[0.97] ${
                                                plan.highlight
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm shadow-green-900/15'
                                                    : plan.tier === 'FREE'
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                                        : 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900'
                                            }`}
                                        >
                                            {plan.cta}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Rodapé */}
                <div className="px-4 pb-4 pt-1 flex flex-col items-center gap-2">
                    <button
                        onClick={onClose}
                        className="sm:hidden w-full py-3 rounded-xl text-sm font-black bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 active:scale-[0.98] transition-all"
                    >
                        Fechar
                    </button>
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                        Pagamento seguro via Asaas · SSL 256-bit · Cancele a qualquer momento
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── PlanCard (desktop) ───────────────────────────────────────────────────────
function PlanCard({
    plan,
    onSubscribe,
}: {
    plan: (typeof PLANS)[number];
    onSubscribe: (tier: string) => void;
}) {
    return (
        <div
            className={`relative flex flex-col rounded-2xl border-2 p-4 transition-all ${
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
                plan.highlight ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
            }`}>
                {plan.name}
            </p>

            <div className="mb-1">
                <span className={`text-2xl font-black ${
                    plan.highlight ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-100'
                }`}>
                    {plan.price}
                </span>
                <span className="text-xs text-gray-400 ml-1">{plan.period}</span>
            </div>

            {'saving' in plan && (
                <p className="text-[11px] font-semibold text-green-600 dark:text-green-400 mb-2">{plan.saving}</p>
            )}

            <div className="border-t border-gray-100 dark:border-gray-700 my-2.5" />

            <ul className="space-y-1.5 flex-1 mb-4">
                {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 text-[10px] font-black mt-0.5">✓</span>
                        {f}
                    </li>
                ))}
                {'locked' in plan && plan.locked?.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-300 dark:text-gray-600 line-through">
                        <span className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 text-[10px] mt-0.5">✗</span>
                        {f}
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onSubscribe(plan.tier)}
                className={`w-full py-2.5 rounded-xl text-sm font-black transition-all active:scale-[0.97] ${
                    plan.highlight
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm shadow-green-900/15'
                        : plan.tier === 'FREE'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            : 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-white'
                }`}
            >
                {plan.cta}
            </button>
        </div>
    );
}
