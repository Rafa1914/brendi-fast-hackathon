/**
 * Utilitários para formatação de valores
 */

/**
 * Formata um valor numérico como moeda brasileira (BRL)
 * Converte centavos para reais (divide por 100)
 * 
 * @param value - Valor em centavos
 * @returns String formatada como moeda (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value / 100)
}

/**
 * Formata um valor numérico como número brasileiro
 * 
 * @param value - Valor numérico
 * @returns String formatada como número (ex: "1.234,56")
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

/**
 * Formata um valor numérico como porcentagem
 * 
 * @param value - Valor numérico
 * @param decimals - Número de casas decimais (padrão: 1)
 * @returns String formatada como porcentagem (ex: "12,5%")
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Formata uma data como string no formato brasileiro
 * 
 * @param dateString - String de data (ISO ou formato compatível)
 * @param options - Opções de formatação
 * @returns String formatada (ex: "01/12/2023")
 */
export function formatDate(
  dateString: string | Date,
  options?: {
    includeTime?: boolean
    includeSeconds?: boolean
  }
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }
  
  if (options?.includeTime) {
    formatOptions.hour = '2-digit'
    formatOptions.minute = '2-digit'
    
    if (options.includeSeconds) {
      formatOptions.second = '2-digit'
    }
  }
  
  return new Intl.DateTimeFormat('pt-BR', formatOptions).format(date)
}

/**
 * Formata uma data com hora no formato brasileiro
 * 
 * @param dateString - String de data (ISO ou formato compatível)
 * @returns String formatada (ex: "01/12/2023, 14:30")
 */
export function formatDateTime(dateString: string | Date): string {
  return formatDate(dateString, { includeTime: true })
}

/**
 * Formata uma data com hora e segundos no formato brasileiro
 * 
 * @param dateString - String de data (ISO ou formato compatível)
 * @returns String formatada (ex: "01/12/2023, 14:30:45")
 */
export function formatDateTimeWithSeconds(dateString: string | Date): string {
  return formatDate(dateString, { includeTime: true, includeSeconds: true })
}

/**
 * Formata um tempo em segundos para formato legível (minutos e segundos)
 * 
 * @param seconds - Tempo em segundos
 * @returns String formatada (ex: "5min 30s" ou "45s")
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (minutes > 0) {
    if (remainingSeconds > 0) {
      return `${minutes}min ${remainingSeconds}s`
    }
    return `${minutes}min`
  }
  return `${remainingSeconds}s`
}

