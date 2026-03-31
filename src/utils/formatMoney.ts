/**
 * Formata um número como moeda BRL.
 * Ex: 1234.5 → "R$ 1.234,50"
 */
export function formatMoney(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(value);
}

/**
 * Formata um valor de input de texto (digitado pelo usuário) como BRL.
 * Remove tudo que não é dígito e divide por 100 para obter centavos.
 * Ex: "123456" → "R$ 1.234,56"
 */
export function formatInputToBRL(value: string): string {
    const cleanValue = value.replace(/\D/g, '');
    const numeric = Number(cleanValue) / 100;
    return `R$ ${numeric.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

/**
 * Converte uma string formatada em BRL de volta para número.
 * Ex: "R$ 1.234,56" → 1234.56
 */
export function parseBRLToNumber(value: string): number {
    return parseFloat(value.replace(/[^\d]/g, '')) / 100;
}

/**
 * Renderiza o valor ou máscara de privacidade.
 */
export function maskedValue(value: number, showValues: boolean): string {
    return showValues ? formatMoney(value) : 'R$ ••••••';
}
