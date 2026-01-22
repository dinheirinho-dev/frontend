export default function Logo() {
    return (
        <div className="flex flex-col items-center justify-center space-y-2 mb-8">
            {/* Ícone da Moeda Sorridente - Usamos um ícone simples para simular a imagem */}
            <svg
                className="w-12 h-12 text-yellow-500 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="12" cy="12" r="10" />
                <path fill="#4CAF50" d="M15 9h-6a1 1 0 000 2h6a1 1 0 000-2z" />
                <path fill="#4CAF50" d="M12 14a1 1 0 00-1 1v2a1 1 0 002 0v-2a1 1 0 00-1-1z" />
            </svg>
            <h1 className="text-3xl font-extrabold text-green-600">Dinheirinho</h1>
            <p className="text-sm text-gray-500">Faça seu Dinheirinho virar um Dinheirão</p>
        </div>
    );
}