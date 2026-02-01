"use client";

import { useState } from 'react';
import React from 'react';

interface WelcomeModalProps {
    isOpen: boolean;
    userName: string | null | undefined;
    onFinish: (initialBalance: number) => void;
}

export default function WelcomeModal({ isOpen, userName, onFinish }: WelcomeModalProps) {
    const [step, setStep] = useState(1);
    const [valor, setValor] = useState('');

    if (!isOpen) return null;

    const formatToBRL = (value: string) => {
        const cleanValue = value.replace(/\D/g, "");
        const options = { minimumFractionDigits: 2 };
        return (Number(cleanValue) / 100).toLocaleString("pt-BR", options);
    };

    const handleNext = () => {
        if (step === 1) setStep(2);
        else {
            const numericAmount = parseFloat(valor.replace(/[^\d]/g, "")) / 100 || 0;
            onFinish(numericAmount);
        }
    };

    return (
        <div className="fixed inset-0 bg-green-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-green-600 animate-in fade-in zoom-in duration-300">
                {step === 1 ? (
                    <div className="text-center">
                        <div className="text-5xl mb-4">💰</div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">
                            Olá, {userName || "parceiro"}!
                        </h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Bem-vindo ao <strong>Dinheirinho</strong>. O app onde você vê seu Dinheirinho crescer de verdade. Pronto para organizar sua vida financeira?
                        </p>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="text-5xl mb-4">🚀</div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Ponto de Partida</h2>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            Com quanto dinheiro você está começando este mês de <strong>Fevereiro</strong>?
                        </p>
                        <div className="relative mb-6">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-green-600">R$</span>
                            <input
                                type="text"
                                value={valor}
                                onChange={(e) => setValor(formatToBRL(e.target.value))}
                                placeholder="0,00"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-2xl font-black text-gray-800 focus:border-green-500 focus:ring-0 transition-all outline-none"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                <button
                    onClick={handleNext}
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all transform active:scale-95"
                >
                    {step === 1 ? "Bora começar!" : "Finalizar e Ver meu Dashboard"}
                </button>
            </div>
        </div>
    );
}