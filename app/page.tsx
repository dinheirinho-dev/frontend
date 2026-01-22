import React from 'react';

// --- Ícones SVG Inline (Substituindo lucide-react para zero dependências) ---
const Wallet = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h2v-4Z" />
  </svg>
);

const Rocket = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const Trophy = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const TrendingUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans">

      {/* --- HEADER --- */}
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-xl">
              <Wallet className="w-6 h-6 text-green-700" />
            </div>
            <span className="text-2xl font-bold text-green-700 tracking-tight">
              Dinheirinho
            </span>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/login" className="text-gray-600 hover:text-green-700 font-medium transition-colors">
              Login
            </a>
            <a
              href="/cadastro"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30"
            >
              Cadastro
            </a>
          </nav>

          {/* Menu Mobile (Simples) */}
          <div className="md:hidden">
            <a href="/login" className="text-green-700 font-bold text-sm">Entrar</a>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20">
        {/* --- HERO SECTION --- */}
        <section className="relative overflow-hidden bg-green-50/50 pt-20 pb-32">
          {/* Elementos decorativos de fundo */}
          <div className="absolute top-20 right-0 -mr-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-40 left-0 -ml-20 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full text-green-800 font-semibold text-sm mb-8">
              <Trophy className="w-4 h-4" />
              <span>O jeito divertido de poupar</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
              Faça seu Dinheirinho <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                virar um Dinheirão
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Controle financeiro gamificado, fácil de usar e focado em metas.
              Pare de apenas anotar gastos e comece a subir de nível na sua vida financeira.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/cadastro"
                className="group flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-green-600/20 hover:transform hover:-translate-y-1"
              >
                Comece Agora (É Grátis)
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#como-funciona"
                className="text-gray-600 hover:text-green-700 font-semibold px-8 py-4"
              >
                Como funciona?
              </a>
            </div>
          </div>
        </section>

        {/* --- FEATURES / METAS SECTION --- */}
        <section id="como-funciona" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Bata Suas Metas Como um Jogo 🎮
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Esqueça planilhas chatas. No Dinheirinho, cada economia é um ponto de experiência para sua liberdade financeira.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-green-200 transition-all group">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Rocket className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Metas Foguete</h3>
                <p className="text-gray-600 leading-relaxed">
                  Defina objetivos claros. Compre aquele carro ou faça aquela viagem visualizando seu progresso decolar a cada depósito.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-green-200 transition-all group">
                <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Conquistas e Badges</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ganhe medalhas ao manter seu saldo positivo, economizar 3 meses seguidos ou cortar gastos supérfluos.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-green-200 transition-all group">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Pilha Crescente</h3>
                <p className="text-gray-600 leading-relaxed">
                  Visualização gráfica do seu patrimônio acumulado. Veja sua pilha de dinheiro crescer dia após dia.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- STATS / PROOF SECTION --- */}
        <section className="py-20 bg-green-900 text-white rounded-3xl mx-4 md:mx-8 mb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-green-800">
              <div className="p-4">
                <div className="text-4xl font-extrabold mb-2 text-green-400">100%</div>
                <div className="text-green-100">Gratuito para Pessoas Físicas</div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-extrabold mb-2 text-green-400">Gamificado</div>
                <div className="text-green-100">Torne a economia divertida</div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-extrabold mb-2 text-green-400">Seguro</div>
                <div className="text-green-100">Seus dados protegidos</div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA FINAL --- */}
        <section className="py-20 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Pronto para começar sua pilha?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Junte-se a milhares de usuários que estão transformando sua vida financeira hoje mesmo.
            </p>
            <a
              href="/cadastro"
              className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-green-600/30 hover:shadow-2xl transition-all"
            >
              Criar Conta Grátis
            </a>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-1.5 rounded-lg">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Dinheirinho</span>
          </div>

          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Dinheirinho. Todos os direitos reservados.
          </div>

          <div className="flex gap-6">
            {/* Social placeholders */}
            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors"><span className="sr-only">Instagram</span>IG</a>
            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors"><span className="sr-only">Twitter</span>TW</a>
          </div>
        </div>
      </footer>
    </div>
  );
}