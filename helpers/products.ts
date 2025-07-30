export function formatPrice(price: number, currency: Product.Currency | null) {
  const numPrice = Number(price);
  
  // Handle NaN, null, or undefined values
  if (isNaN(numPrice) || numPrice === null || numPrice === undefined) {
    return currency?.symbol ? `${currency.symbol}0.00` : '0.00';
  }

  if (!currency) {
    return numPrice.toFixed(2);
  }

  if (currency?.symbol_first === true) {
    return `${currency?.symbol}${numPrice.toFixed(currency?.precision || 2)}`;
  }

  return `${numPrice.toFixed(currency?.precision || 2)}${currency?.symbol}`;
}