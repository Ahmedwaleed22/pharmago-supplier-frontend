export function formatPrice(price: number, currency: Product.Currency | null) {
  const numPrice = Number(price);
  
  // Handle NaN, null, or undefined values
  if (isNaN(numPrice) || numPrice === null || numPrice === undefined) {
    return currency?.code ? `${currency.code}0.00` : '0.00';
  }

  if (!currency) {
    return numPrice.toFixed(2);
  }

  // Ensure currency symbol is not truncated
  const symbol = currency.code || '';
  
  if (currency?.symbol_first === true) {
    return `${symbol}${numPrice.toFixed(currency?.precision || 2)}`;
  }

  return `${symbol} ${numPrice.toFixed(currency?.precision || 2)}`;
}