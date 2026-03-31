'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { CheckCircle2, AlertTriangle, X, PartyPopper, FileText, CreditCard, Zap, Copy, Check, Lock, ShieldCheck } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── tipos ────────────────────────────────────────────────────────────────────
type PaymentMethod = 'card' | 'pix' | 'boleto';

type PaymentResult =
    | { status: 'success' }
    | { status: 'pending_pix';    qrCodeBase64: string; copyPaste: string }
    | { status: 'pending_boleto'; boletoUrl: string };

type ToastMsg = { text: string; kind: 'success' | 'error' } | null;

// ─── mapa de planos ───────────────────────────────────────────────────────────
const PLAN_MAP: Record<string, { label: string; price: string; cycle: string; value: string }> = {
    MONTHLY:  { label: 'PRO Mensal',           price: 'R$ 14,90',  cycle: '/mês',            value: '14,90'  },
    ANNUAL:   { label: 'PRO Anual',             price: 'R$ 99,90',  cycle: '/ano',            value: '99,90'  },
    LIFETIME: { label: 'PRO Vitalício Founder', price: 'R$ 197,00', cycle: 'pagamento único', value: '197,00' },
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtCard  = (v: string) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
const fmtExp   = (v: string) => { const d = v.replace(/\D/g,'').slice(0,4); return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };
const fmtCpf   = (v: string) => { const d = v.replace(/\D/g,'').slice(0,11); if (d.length<=3) return d; if (d.length<=6) return `${d.slice(0,3)}.${d.slice(3)}`; if (d.length<=9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`; return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`; };
const parseExp = (e: string) => { const [m='',y=''] = e.split('/'); return { month: m.padStart(2,'0'), year: y.length===2 ? `20${y}` : y }; };

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }: { msg: ToastMsg; onDone: () => void }) {
    useEffect(() => {
        if (!msg) return;
        const t = setTimeout(onDone, 4000);
        return () => clearTimeout(t);
    }, [msg, onDone]);

    if (!msg) return null;

    return (
        <div className={`
            fixed z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl
            text-sm font-semibold
            transition-all animate-in slide-in-from-top-4 duration-300
            /* mobile: bottom-center */
            bottom-5 left-4 right-4 mx-auto max-w-sm
            /* desktop: top-right */
            sm:bottom-auto sm:top-5 sm:right-5 sm:left-auto sm:max-w-xs
            ${msg.kind === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }
        `}>
            {msg.kind === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span className="leading-snug">{msg.text}</span>
            <button onClick={onDone} className="ml-auto shrink-0 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
    );
}

// ─── inner component ──────────────────────────────────────────────────────────
function CheckoutInner() {
    const searchParams = useSearchParams();
    const router       = useRouter();
    const { userId }   = useAuth();

    const tier = (searchParams.get('tier') ?? 'MONTHLY').toUpperCase();
    const plan = PLAN_MAP[tier] ?? PLAN_MAP['MONTHLY'];

    const [method,    setMethod]    = useState<PaymentMethod>('card');
    const [fullName,  setFullName]  = useState('');
    const [email,     setEmail]     = useState('');
    const [cpf,       setCpf]       = useState('');
    const [cardNumber,setCardNumber]= useState('');
    const [cardName,  setCardName]  = useState('');
    const [expiry,    setExpiry]    = useState('');
    const [cvv,       setCvv]       = useState('');
    const [flipped,   setFlipped]   = useState(false);

    const [loading,       setLoading]       = useState(false);
    const [apiError,      setApiError]      = useState('');
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
    const [copied,        setCopied]        = useState(false);
    const [toast,         setToast]         = useState<ToastMsg>(null);

    const display = {
        number: cardNumber || '•••• •••• •••• ••••',
        name:   cardName   || 'SEU NOME AQUI',
        expiry: expiry     || 'MM/AA',
    };

    // ── submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');

        const cpfClean = cpf.replace(/\D/g, '');
        if (cpfClean.length < 11) { setApiError('Informe um CPF válido (11 dígitos).'); return; }
        if (!userId) { setApiError('Usuário não autenticado. Faça login novamente.'); return; }

        if (method === 'card') {
            if (cardNumber.replace(/\s/g,'').length < 16) { setApiError('Número do cartão inválido.'); return; }
            if (!cardName.trim())  { setApiError('Informe o nome como está no cartão.'); return; }
            if (expiry.length < 5) { setApiError('Informe a validade (MM/AA).'); return; }
            if (cvv.length < 3)    { setApiError('CVV inválido.'); return; }
        }

        const billingTypeMap: Record<PaymentMethod, string> = { card: 'CREDIT_CARD', pix: 'PIX', boleto: 'BOLETO' };
        const { month, year } = parseExp(expiry);

        const body: Record<string, string> = { plan_tier: tier, cpf: cpfClean, billingType: billingTypeMap[method] };
        if (method === 'card') {
            body.creditCardNumber      = cardNumber.replace(/\s/g, '');
            body.creditCardName        = cardName;
            body.creditCardExpiryMonth = month;
            body.creditCardExpiryYear  = year;
            body.creditCardCcv         = cvv;
        }

        setLoading(true);
        try {
            const res  = await fetch(`${API_URL}/billing/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-clerk-id': userId },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (!res.ok) {
                const msg = data.detail ?? 'Ocorreu um erro. Tente novamente.';
                setApiError(msg);
                setToast({ text: msg, kind: 'error' });
                return;
            }

            setPaymentResult(data as PaymentResult);

            if (data.status === 'success') {
                setToast({ text: 'Pagamento aprovado! Seja bem-vindo ao PRO 🎉', kind: 'success' });
                setTimeout(() => router.push('/dashboard'), 3000);
            } else if (data.status === 'pending_pix') {
                setToast({ text: 'QR Code gerado! Escaneie para pagar.', kind: 'success' });
            } else {
                setToast({ text: 'Boleto gerado com sucesso!', kind: 'success' });
            }
        } catch {
            const msg = 'Falha de conexão. Verifique sua internet.';
            setApiError(msg);
            setToast({ text: msg, kind: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (paymentResult?.status !== 'pending_pix') return;
        navigator.clipboard.writeText(paymentResult.copyPaste).then(() => {
            setCopied(true);
            setToast({ text: 'Código Pix copiado!', kind: 'success' });
            setTimeout(() => setCopied(false), 3000);
        });
    };

    // ── layout ─────────────────────────────────────────────────────────────────
    return (
        <>
            <Toast msg={toast} onDone={() => setToast(null)} />

            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 flex items-start lg:items-center justify-center p-3 sm:p-4">

                {/* Fundo decorativo */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-teal-600/10 blur-3xl" />
                </div>

                <div className="relative z-10 w-full max-w-5xl">

                    {/* Header mobile — voltar + logo */}
                    <div className="flex items-center justify-between mb-5 md:hidden">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Voltar
                        </button>
                        <Logo />
                        <div className="w-16" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5 items-start">

                        {/* ════ COLUNA ESQUERDA — resumo ════ */}
                        <div className="bg-gradient-to-br from-slate-900 to-gray-900 p-4 md:p-6 flex flex-col gap-4 md:gap-6 border-b md:border-b-0 md:border-r border-white/5 md:sticky md:top-0 md:self-start">
                            <div className="hidden md:block"><Logo /></div>

                            {/* Resumo dinâmico */}
                            <div>
                                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest mb-2.5">Resumo da Assinatura</p>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-white font-bold text-sm leading-tight">Dinheirinho</p>
                                            <p className="text-emerald-400 text-sm font-semibold mt-0.5">{plan.label}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-emerald-400 font-black text-lg sm:text-xl">{plan.price}</p>
                                            <p className="text-gray-500 text-xs">{plan.cycle}</p>
                                        </div>
                                    </div>
                                    {/* Features — ocultas no mobile para poupar espaço */}
                                    <div className="hidden md:block border-t border-white/10 mt-4 pt-4 space-y-2.5">
                                        {['Acesso Total às Funcionalidades','Relatórios Financeiros Ilimitados','Criação de Metas Infinitas','Suporte Prioritário'].map(b => (
                                            <div key={b} className="flex items-center gap-3">
                                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                                                    <svg className="w-2.5 h-2.5 text-emerald-400" viewBox="0 0 12 12" fill="none">
                                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </span>
                                                <span className="text-gray-300 text-xs sm:text-sm">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Selos — ocultos no mobile */}
                            <div className="hidden md:block space-y-2">
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Segurança & Conformidade</p>
                                {([
                                    {icon:<Lock className="w-4 h-4" />,text:'Pagamento Seguro via Asaas'},
                                    {icon:<ShieldCheck className="w-4 h-4" />,text:'Criptografia SSL de 256 bits'},
                                    {icon:<CheckCircle2 className="w-4 h-4" />,text:'Em conformidade com PCI-DSS'},
                                ] as const).map(s => (
                                    <div key={s.text} className="flex items-center gap-2.5 text-gray-400">
                                        {s.icon}
                                        <span className="text-xs sm:text-sm">{s.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="hidden md:flex flex-col gap-1 mt-auto">
                                <button onClick={() => router.back()} className="text-left text-sm text-gray-500 hover:text-emerald-400 transition-colors">← Alterar Plano</button>
                            </div>
                        </div>

                        {/* ════ COLUNA DIREITA — formulário ou resultado ════ */}
                        <div className="bg-gray-950 p-4 md:p-6 flex flex-col gap-4 md:gap-5 min-w-0">

                            {/* ── RESULTADO: Cartão aprovado ── */}
                            {paymentResult?.status === 'success' && (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-8 sm:py-12">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center animate-bounce"><PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" /></div>
                                    <div>
                                        <h2 className="text-white font-black text-xl sm:text-2xl mb-1.5">Pagamento Aprovado!</h2>
                                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">Bem-vindo ao Dinheirinho PRO! Redirecionando para o dashboard…</p>
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{animationDelay:`${i*200}ms`}} />)}
                                    </div>
                                    <button onClick={() => router.push('/dashboard')} className="mt-2 bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-black px-8 py-3 rounded-2xl shadow-sm shadow-emerald-900/20 transition-all active:scale-[0.98]">
                                        Ir para o Dashboard agora
                                    </button>
                                </div>
                            )}

                            {/* ── RESULTADO: Aguardando PIX ── */}
                            {paymentResult?.status === 'pending_pix' && (
                                <div className="flex-1 flex flex-col items-center gap-4 text-center py-4">
                                    <div>
                                        <h2 className="text-white font-black text-xl mb-1">Pague com Pix</h2>
                                        <p className="text-gray-400 text-sm max-w-xs mx-auto">Escaneie o QR Code ou copie o código. O acesso é liberado em segundos.</p>
                                    </div>
                                    {paymentResult.qrCodeBase64
                                        ? <div className="bg-white p-3 rounded-2xl shadow-xl"><img src={`data:image/png;base64,${paymentResult.qrCodeBase64}`} alt="QR Code Pix" className="w-44 h-44 sm:w-52 sm:h-52 block" /></div>
                                        : <div className="w-44 h-44 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-500 text-sm">QR Code indisponível</div>
                                    }
                                    <div className="w-full max-w-sm">
                                        <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-widest">Pix Copia e Cola</p>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                            <p className="flex-1 text-gray-300 text-xs font-mono truncate">{paymentResult.copyPaste || '—'}</p>
                                            <button onClick={handleCopy} className={`shrink-0 text-xs font-black px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                                                {copied ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-xs">Seu acesso PRO será liberado automaticamente em até 1 minuto após o pagamento.</p>
                                    <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-emerald-400 transition-colors">Já paguei, ir para o dashboard →</button>
                                </div>
                            )}

                            {/* ── RESULTADO: Boleto gerado ── */}
                            {paymentResult?.status === 'pending_boleto' && (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-8 sm:py-12">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center"><FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" /></div>
                                    <div>
                                        <h2 className="text-white font-black text-xl mb-1.5">Boleto Gerado!</h2>
                                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">Pague até o vencimento. O acesso PRO é liberado em até 3 dias úteis após a compensação.</p>
                                    </div>
                                    <a href={paymentResult.boletoUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg transition-all active:scale-[0.98]">
                                        Visualizar / Imprimir Boleto
                                    </a>
                                    <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-emerald-400 transition-colors">Voltar para o dashboard</button>
                                </div>
                            )}

                            {/* ── FORMULÁRIO ── */}
                            {!paymentResult && (
                                <>
                                    <div>
                                        <h1 className="text-white text-lg sm:text-xl font-black tracking-tight">Dados de Pagamento</h1>
                                        <p className="text-gray-500 text-xs sm:text-sm mt-1">Seus dados são protegidos e criptografados.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">

                                        {/* Dados pessoais */}
                                        <Field label="Nome Completo (como no documento)">
                                            <input type="text" placeholder="João da Silva" value={fullName} onChange={e => setFullName(e.target.value)} required className={inputCls} />
                                        </Field>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <Field label="E-mail Principal">
                                                <input type="email" placeholder="joao@email.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
                                            </Field>
                                            <Field label="CPF / CNPJ">
                                                <input type="text" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(fmtCpf(e.target.value))} required className={inputCls} />
                                            </Field>
                                        </div>

                                        <div className="border-t border-white/5" />

                                        {/* Método */}
                                        <div>
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Forma de Pagamento</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {([
                                                    {id:'card',label:'Cartão',icon:<CreditCard className="w-5 h-5" />},
                                                    {id:'pix',label:'Pix',icon:<Zap className="w-5 h-5" />},
                                                    {id:'boleto',label:'Boleto',icon:<FileText className="w-5 h-5" />},
                                                ] as const).map(m => (
                                                    <button key={m.id} type="button" onClick={() => { setMethod(m.id); setApiError(''); }} className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${method === m.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}>
                                                        {m.icon}
                                                        {m.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* ── Cartão ── */}
                                        {method === 'card' && (
                                            /* Desktop: campos à esquerda, cartão 3D à direita centralizado */
                                            <div className="flex flex-col lg:flex-row-reverse lg:items-center gap-5">
                                                {/* Cartão 3D */}
                                                <div className="shrink-0 lg:w-[240px]">
                                                    <div
                                                        className="relative w-full max-w-[300px] mx-auto lg:max-w-none aspect-[1.586/1] cursor-pointer"
                                                        style={{ perspective: '1000px' }}
                                                        onClick={() => setFlipped(f => !f)}
                                                    >
                                                        <div
                                                            className="relative w-full h-full transition-transform duration-500"
                                                            style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                                                        >
                                                            {/* Frente */}
                                                            <div
                                                                className="absolute inset-0 rounded-xl sm:rounded-2xl p-4 flex flex-col justify-between overflow-hidden"
                                                                style={{ backfaceVisibility:'hidden', background:'linear-gradient(135deg,#064e3b 0%,#065f46 40%,#047857 100%)' }}
                                                            >
                                                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                                                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 translate-x-10 -translate-y-10" />
                                                                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/20 -translate-x-6 translate-y-6" />
                                                                </div>
                                                                <div className="relative flex justify-between items-start">
                                                                    <span className="text-white font-black text-base">$</span>
                                                                    <CardNetworkLogos />
                                                                </div>
                                                                <div className="relative">
                                                                    <div className="w-8 h-6 rounded-md bg-yellow-300/80 mb-2.5 grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5">
                                                                        {Array.from({length:9}).map((_,i) => <div key={i} className="bg-yellow-600/40 rounded-[1px]" />)}
                                                                    </div>
                                                                    <p className="text-white font-mono text-xs sm:text-sm tracking-[0.15em] mb-2 drop-shadow">{display.number}</p>
                                                                    <div className="flex justify-between items-end">
                                                                        <div>
                                                                            <p className="text-emerald-200/60 text-[8px] uppercase tracking-widest">Titular</p>
                                                                            <p className="text-white font-semibold text-[11px] uppercase truncate max-w-[100px]">{display.name}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-emerald-200/60 text-[8px] uppercase tracking-widest">Validade</p>
                                                                            <p className="text-white font-semibold text-[11px]">{display.expiry}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Verso */}
                                                            <div
                                                                className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden"
                                                                style={{ backfaceVisibility:'hidden', transform:'rotateY(180deg)', background:'linear-gradient(135deg,#064e3b 0%,#065f46 40%,#047857 100%)' }}
                                                            >
                                                                <div className="w-full h-8 bg-gray-900/80 mt-5" />
                                                                <div className="px-4 mt-3">
                                                                    <div className="h-6 bg-white/10 rounded flex items-center justify-end px-2">
                                                                        <span className="text-white font-mono text-xs tracking-widest">{cvv || '•••'}</span>
                                                                    </div>
                                                                    <p className="text-emerald-200/50 text-[9px] mt-1.5 text-right">CVV</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-center text-gray-600 text-[10px] mt-1.5">Clique no cartão para ver o verso</p>
                                                </div>

                                                {/* Campos do cartão */}
                                                <div className="flex-1 flex flex-col gap-3">
                                                    <Field label="Número do Cartão">
                                                        <div className="relative">
                                                            <input type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(fmtCard(e.target.value))} required className={`${inputCls} pr-20`} />
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2"><CardNetworkLogos small /></div>
                                                        </div>
                                                    </Field>
                                                    <Field label="Nome no Cartão">
                                                        <input type="text" placeholder="JOÃO DA SILVA" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} required className={inputCls} />
                                                    </Field>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Field label="Validade (MM/AA)">
                                                            <input type="text" placeholder="MM/AA" value={expiry} onChange={e => setExpiry(fmtExp(e.target.value))} required className={inputCls} />
                                                        </Field>
                                                        <Field label="CVV">
                                                            <input type="text" placeholder="•••" maxLength={4} value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)} required className={inputCls} />
                                                        </Field>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Info: Pix */}
                                        {method === 'pix' && (
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-2.5 text-center">
                                                <Zap className="w-10 h-10 text-emerald-400" />
                                                <p className="text-white font-bold text-sm">Pagamento instantâneo via Pix</p>
                                                <p className="text-gray-400 text-xs leading-relaxed max-w-xs">Ao clicar em Finalizar, um QR Code será gerado. O acesso é liberado em segundos após a confirmação.</p>
                                            </div>
                                        )}

                                        {/* Info: Boleto */}
                                        {method === 'boleto' && (
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-2.5 text-center">
                                                <FileText className="w-10 h-10 text-blue-400" />
                                                <p className="text-white font-bold text-sm">Pagamento via Boleto Bancário</p>
                                                <p className="text-gray-400 text-xs leading-relaxed max-w-xs">O boleto será gerado após clicar em Finalizar. Prazo de compensação: até 3 dias úteis.</p>
                                            </div>
                                        )}

                                        {/* Erro da API */}
                                        {apiError && (
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-2.5">
                                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                                <p className="text-red-400 text-sm font-medium leading-snug">{apiError}</p>
                                            </div>
                                        )}

                                        {/* Botão submit */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-black py-3.5 sm:py-4 rounded-2xl shadow-sm shadow-emerald-900/20 transition-all active:scale-[0.98] text-sm sm:text-base"
                                        >
                                            {loading
                                                ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Processando…</span>
                                                : `Finalizar Pagamento — R$ ${plan.value}`
                                            }
                                        </button>

                                        <p className="text-center text-gray-600 text-xs leading-relaxed">
                                            {tier === 'LIFETIME' ? 'Pagamento único. Acesso vitalício garantido.' : 'Renovação automática. Cancele a qualquer momento, sem multa.'}
                                        </p>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-gray-700 text-xs mt-5">
                        © {new Date().getFullYear()} Dinheirinho · Todos os direitos reservados
                    </p>
                </div>
            </div>
        </>
    );
}

// ─── page export com Suspense ─────────────────────────────────────────────────
export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-950 flex items-center justify-center text-emerald-400 font-bold animate-pulse">
                Carregando checkout…
            </div>
        }>
            <CheckoutInner />
        </Suspense>
    );
}

// ─── sub-componentes ──────────────────────────────────────────────────────────
function Logo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm shadow-emerald-900/20">
                <span className="text-white font-black text-base sm:text-lg leading-none">$</span>
            </div>
            <span className="text-white font-black text-base sm:text-lg tracking-tight">Dinheirinho</span>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-400 tracking-wide">{label}</label>
            {children}
        </div>
    );
}

function CardNetworkLogos({ small = false }: { small?: boolean }) {
    return (
        <div className={`flex items-center ${small ? 'gap-0.5' : 'gap-1'}`}>
            <span className={`font-black italic ${small ? 'text-[9px]' : 'text-xs'} text-blue-300`}>VISA</span>
            <span className="relative inline-flex items-center">
                <span className={`${small ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} rounded-full bg-red-500 opacity-90`} />
                <span className={`${small ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} rounded-full bg-yellow-400 opacity-90 -ml-1`} />
            </span>
        </div>
    );
}

const inputCls =
    'w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm text-white placeholder-gray-600 ' +
    'focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/50 transition-all';
