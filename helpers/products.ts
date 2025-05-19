export function formatPrice(price: number, currency: Product.Currency | null): string {
  if (!currency) {
    return price.toFixed(2);
  }

  if (currency?.symbol_first === 1) {
    return `${currency?.symbol}${price.toFixed(currency?.precision)}`;
  }

  return `${price.toFixed(currency?.precision)}${currency?.symbol}`;
}