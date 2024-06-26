import CategoryWithProducts from '@/components/ui/CategoryWithProducts';
import CategorySlider from '@/components/ui/CategorySlider';
import ProductList from '@/components/ui/ProductList';
import { categoryService, productService } from '@/server/services';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { getUserSession } from '@/server/auth/auth.utils';

const paramsSchema = z.object({
  categoryId: z.number().int().positive(),
});

type SearchParams = z.infer<typeof paramsSchema>;

interface Props {
  searchParams: SearchParams;
}

export default async function ProductItems({ searchParams }: Props) {
  const user = await getUserSession();
  const categoryId = searchParams.categoryId;

  if (categoryId) {
    const result = await paramsSchema.safeParseAsync({
      categoryId: Number(categoryId),
    });

    if (!result.success) {
      notFound();
    }

    const category = await categoryService.findById(result.data.categoryId);

    if (!category) {
      notFound();
    }

    const categories = await categoryService.findAllTags();

    return (
      <div className="w-full space-y-6">
        <CategorySlider categories={categories} skip={category.id} />
        <CategoryWithProducts category={category} />
      </div>
    );
  }

  const products = await productService.findAll({
    userId: user?.id,
  });
  const categories = await categoryService.findAllTags();

  return (
    <div className="w-full space-y-6">
      <CategorySlider categories={categories} />
      <ProductList products={products} />
    </div>
  );
}
