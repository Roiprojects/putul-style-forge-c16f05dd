import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/data/products";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Props {
  currentProduct: Product;
}

const CompleteTheLook = ({ currentProduct }: Props) => {
  const { data: products = [] } = useProducts();
  const { formatPrice } = useCurrency();

  // Suggest products from same category, excluding current
  const suggestions = products
    .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
    .slice(0, 4);

  if (suggestions.length === 0) return null;

  const bundleTotal = [currentProduct, ...suggestions.slice(0, 2)].reduce((s, p) => s + p.price, 0);
  const bundlePrice = Math.round(bundleTotal * 0.9);

  return (
    <section className="py-8 border-t">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-2xl font-serif font-semibold">Complete the Look</h2>
        <span className="text-sm text-muted-foreground">Bundle & save 10%</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {suggestions.map(p => (
          <Link key={p.id} to={`/product/${p.id}`} className="group">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted mb-2">
              <img
                src={p.images?.[0]}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <p className="text-sm line-clamp-1">{p.name}</p>
            <p className="text-sm font-semibold">{formatPrice(p.price)}</p>
          </Link>
        ))}
      </div>

      <div className="bg-muted/40 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Bundle this with 2 picks</p>
          <p className="text-lg">
            <span className="font-semibold">{formatPrice(bundlePrice)}</span>
            <span className="text-sm text-muted-foreground line-through ml-2">{formatPrice(bundleTotal)}</span>
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
          Save {formatPrice(bundleTotal - bundlePrice)}
        </span>
      </div>
    </section>
  );
};

export default CompleteTheLook;
