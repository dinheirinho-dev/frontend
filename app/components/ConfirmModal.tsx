"use client";

import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    loading?: boolean;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 animate-in fade-in zoom-in duration-200">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <span className="text-red-600 text-xl font-bold">⚠️</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-800 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm disabled:opacity-50"
                    >
                        Não, manter
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all text-sm disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? "Excluindo..." : "Sim, excluir"}
                    </button>
                </div>
            </div>
        </div>
    );
}