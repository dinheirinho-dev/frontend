'use client';

import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Checa se o usuário já escolheu antes ou pega o tema do Windows/Mac dele
    const saved = localStorage.getItem('theme');

    // Default: dark mode, a menos que o usuário tenha escolhido explicitamente 'light'
    if (saved !== 'light') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggle = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    
    // A mágica acontece aqui: adicionando/removendo a classe do HTML
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return { isDark, toggle, mounted };
}