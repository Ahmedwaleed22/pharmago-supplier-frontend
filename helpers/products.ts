export function formatPrice(price: number, currency: Product.Currency | null) {
  price = Number(price);

  if (!currency) {
    return price?.toFixed(2);
  }

  if (currency?.symbol_first === true) {
    return `${currency?.symbol}${price?.toFixed(currency?.precision)}`;
  }

  return `${price?.toFixed(currency?.precision)}${currency?.symbol}`;
}