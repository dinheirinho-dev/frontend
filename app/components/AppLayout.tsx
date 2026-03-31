'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useState } from 'react';
import { useDarkMode } from '../../src/hooks/useDarkMode';
import { Moon, Sun } from 'lucide-react';

const navItems = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        href: '/relatorio',
        label: 'Relatório',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        href: '/investimentos',
        label: 'Investimentos',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
    },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isDark, toggle } = useDarkMode();
    const [collapsed, setCollapsed] = useState(false);

    const sidebarW = collapsed ? 'w-14' : 'w-56';
    const mainML  = collapsed ? 'md:ml-14' : 'md:ml-56';

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-x-hidden w-full">

            {/* ── Sidebar desktop ── */}
            <aside className={`hidden md:flex flex-col fixed left-0 top-0 h-full ${sidebarW} bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 z-40 shadow-sm transition-all duration-200 overflow-hidden`}>

                {/* Logo */}
                <div className={`flex items-center gap-2 px-3 py-5 border-b border-gray-100 dark:border-gray-700 ${collapsed ? 'justify-center' : 'px-5'}`}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#6ee7b7 0%,#059669 100%)' }}>
                        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                            <text x="10" y="16" fontFamily="Arial Black, Arial, sans-serif" fontSize="16" fontWeight="900" fill="white" textAnchor="middle">$</text>
                        </svg>
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-black text-green-700 dark:text-green-400 tracking-tight whitespace-nowrap">Dinheirinho</span>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={collapsed ? item.label : undefined}
                                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${collapsed ? 'justify-center' : ''} ${
                                    active
                                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                            >
                                {item.icon}
                                {!collapsed && item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Rodapé: tema + perfil + colapsar ── */}
                <div className="px-2 py-3 border-t border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2">

                    {/* Tema */}
                    <button
                        onClick={toggle}
                        aria-label="Alternar tema"
                        title="Alternar tema"
                        className={`flex items-center gap-3 w-full px-2.5 py-2 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-all ${collapsed ? 'justify-center' : ''}`}
                    >
                        <Moon className="w-5 h-5 shrink-0 dark:hidden" />
                        <Sun className="w-5 h-5 shrink-0 hidden dark:block" />
                        {!collapsed && (
                            <>
                                <span className="dark:hidden">Modo Escuro</span>
                                <span className="hidden dark:block">Modo Claro</span>
                            </>
                        )}
                    </button>

                    {/* Perfil */}
                    <div className={`flex items-center gap-3 w-full px-2.5 py-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
                        <UserButton />
                        {!collapsed && <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Minha Conta</span>}
                    </div>

                    {/* Colapsar */}
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
                        title={collapsed ? 'Expandir menu' : 'Recolher menu'}
                        className={`flex items-center gap-3 w-full px-2.5 py-2 rounded-xl text-sm font-semibold text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-all ${collapsed ? 'justify-center' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                        {!collapsed && <span>Recolher</span>}
                    </button>
                </div>
            </aside>

            {/* Conteúdo principal */}
            <main className={`flex-1 ${mainML} pb-32 md:pb-0 transition-all duration-200 overflow-x-hidden min-w-0`}>
                {children}
            </main>

            {/* ── Bottom nav mobile ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-around px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] shadow-lg">
                {navItems.map((item) => {
                    const active = pathname === item.href;
                    const shortLabel = item.label === 'Investimentos' ? 'Ativos' : item.label;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[9px] font-bold transition-all min-w-0 ${
                                active
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-400 dark:text-gray-500'
                            }`}
                        >
                            {item.icon}
                            <span className="truncate w-full text-center">{shortLabel}</span>
                        </Link>
                    );
                })}
                <button
                    onClick={toggle}
                    aria-label="Alternar tema"
                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[9px] font-bold text-gray-400 dark:text-gray-500"
                >
                    <Moon className="w-5 h-5 shrink-0 dark:hidden" />
                    <Sun className="w-5 h-5 shrink-0 hidden dark:block" />
                    <span>Tema</span>
                </button>
                <div className="flex flex-col items-center gap-0.5 px-2 py-1.5">
                    <UserButton />
                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">Conta</span>
                </div>
            </nav>
        </div>
    );
}
