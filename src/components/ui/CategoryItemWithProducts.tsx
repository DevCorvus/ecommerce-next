import { CategoryWithProducts } from '@/shared/dtos/category.dto';
import ProductList from './ProductList';

interface Props {
  categoryWithProducts: CategoryWithProducts;
}

export default function CategoryItemWithProducts({
  categoryWithProducts,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <header className="font-semibold text-green-800 text-2xl">
        <h1>
          {categoryWithProducts.title} ({categoryWithProducts.products.length})
        </h1>
      </header>
      <ProductList products={categoryWithProducts.products} />
    </div>
  );
}
