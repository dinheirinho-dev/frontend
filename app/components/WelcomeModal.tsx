"use client";
import React, { useState } from 'react';

export default function WelcomeModal({ userName, onComplete }: { userName: string, onComplete: () => void }) {
    const [goal, setGoal] = useState("");

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] p-8 md:p-12 max-w-lg w-full shadow-2xl relative overflow-hidden">
                {/* Detalhe visual de fundo */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-60" />

                <div className="relative z-10 text-center">
                    <div className="text-5xl mb-6 animate-bounce">🌱</div>
                    <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                        Fala, {userName || "investidor"}!
                    </h2>
                    <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                        O Dinheirinho está pronto. Para começar, qual o seu **primeiro grande objetivo** financeiro?
                    </p>

                    <div className="space-y-4">
                        <input
                            type="text"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="Ex: Reserva de Emergência, Viagem..."
                            className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-700"
                        />

                        <button
                            onClick={() => onComplete()} // Aqui você chamaria sua função de criar meta
                            className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-green-600 active:scale-95 transition-all"
                        >
                            Começar minha jornada 🚀
                        </button>

                        <button
                            onClick={onComplete}
                            className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-gray-600 transition-colors"
                        >
                            Configurar depois
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}