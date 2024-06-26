'use client';

import {
  CreateUpdatePartialProductDto,
  ProductDto,
} from '@/shared/dtos/product.dto';
import { FocusEvent, FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader, { FileUpload } from '@/components/ui/ImageUploader';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUpdatePartialProductSchema } from '@/shared/schemas/product.schema';
import CategoryTagsInput from '@/components/ui/CategoryTagsInput';
import { CategoryTagDto } from '@/shared/dtos/category.dto';
import { getMoneyString } from '@/lib/dinero';
import { useUpdateProduct } from '@/data/product';
import { toastError } from '@/lib/toast';
import SubmitButton from './SubmitButton';

interface Props {
  product: ProductDto;
  categoryTags: CategoryTagDto[];
}

export default function EditProductForm({ product, categoryTags }: Props) {
  const router = useRouter();

  const [images, setImages] = useState<FileUpload[]>([]);
  const [notEnoughImagesError, setNotEnoughImagesError] =
    useState<boolean>(false);
  const [imageUploadError, setImageUploadError] = useState<boolean>(false);

  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [notEnoughCategoriesError, setNotEnoughCategoriesError] =
    useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateUpdatePartialProductDto>({
    resolver: zodResolver(createUpdatePartialProductSchema),
    defaultValues: {
      title: product.title,
      description: product.description,
      stock: product.stock,
    },
  });

  const updateProductMutation = useUpdateProduct();

  const onSubmit: SubmitHandler<CreateUpdatePartialProductDto> = async (
    data,
  ) => {
    const noImages = images.length === 0;
    const noCategories = categoryIds.length === 0;

    if (noImages || noCategories || imageUploadError) return;

    const formData = new FormData();

    formData.set('title', data.title);
    formData.set('description', data.description);
    formData.set('price', String(data.price));
    formData.set('stock', String(data.stock));

    images.forEach((image) => formData.append('images', image.file));
    formData.append(
      'imageFilenamesToKeep',
      JSON.stringify(
        images
          .filter((image) => Boolean(image.keep))
          .map((image) => image.file.name),
      ),
    );

    formData.append('categories', JSON.stringify(categoryIds));

    try {
      await updateProductMutation.mutateAsync({
        productId: product.id,
        formData,
      });
      return router.push(`/items/${product.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const submitWrapper = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setNotEnoughImagesError(images.length === 0);
    setNotEnoughCategoriesError(categoryIds.length === 0);

    const cb = handleSubmit(onSubmit);
    await cb(e);
  };

  const handlePriceBlur = (e: FocusEvent<HTMLInputElement>) => {
    const price = Number(e.target.value);
    if (price > 1) {
      setValue('price', price.toFixed(2) as unknown as number);
    } else {
      setValue('price', '1.00' as unknown as number, { shouldValidate: true });
    }
  };

  const handleStockBlur = (e: FocusEvent<HTMLInputElement>) => {
    const stock = Number(e.target.value);
    if (stock < 1) {
      setValue('stock', 1, { shouldValidate: true });
    }
  };

  const addImage = useCallback(({ file, keep }: FileUpload) => {
    setImages((prev) => {
      if (!prev.some((image) => image.file.name === file.name)) {
        return [...prev, { file, keep }];
      } else {
        return prev;
      }
    });
    setNotEnoughImagesError(false);
  }, []);

  const removeImage = (name: string) => {
    if (images.length === 1) {
      setNotEnoughImagesError(true);
    }
    setImages((prev) => prev.filter((image) => image.file.name !== name));
  };

  const description = watch('description');

  return (
    <form
      onSubmit={submitWrapper}
      className="w-full max-w-md space-y-6 rounded-lg border-2 border-gray-50 bg-white p-8 shadow-md"
    >
      <header>
        <h1 className="text-2xl font-bold text-cyan-700">Edit Product</h1>
      </header>
      <section className="w-full space-y-6">
        <ImageUploader
          defaultImages={product.images}
          addImage={addImage}
          removeImage={removeImage}
          setImageUploadError={setImageUploadError}
          notEnoughImagesError={notEnoughImagesError}
        />
        <div className="space-y-2">
          <label htmlFor="title" className="text-slate-500">
            Title
          </label>
          <input
            {...register('title')}
            id="title"
            type="text"
            placeholder="Enter product title"
            className="input p-3"
          />
          {errors.title && (
            <p className="text-red-400">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-slate-500">
            Description
          </label>
          <div>
            <textarea
              {...register('description')}
              id="description"
              cols={30}
              rows={5}
              placeholder="Enter product description"
              className="input p-3"
            />
            <span className="block text-right text-xs text-slate-500/50">
              ({description.length}/500)
            </span>
          </div>
          {errors.description && (
            <p className="text-red-400">{errors.description.message}</p>
          )}
        </div>
        <div className="flex justify-between">
          <div className="w-[45%] space-y-2">
            <label htmlFor="price" className="text-slate-500">
              Price (USD)
            </label>
            <input
              {...register('price', { onBlur: handlePriceBlur })}
              id="price"
              defaultValue={getMoneyString(product.price)}
              min={1}
              step=".01"
              type="number"
              placeholder="Enter product price"
              className="input p-3"
            />
            {errors.price && (
              <p className="text-red-400">{errors.price.message}</p>
            )}
          </div>
          <div className="w-[45%] space-y-2">
            <label htmlFor="stock" className="text-slate-500">
              Stock
            </label>
            <input
              {...register('stock', {
                valueAsNumber: true,
                onBlur: handleStockBlur,
              })}
              id="stock"
              defaultValue={1}
              min={1}
              type="number"
              placeholder="Enter product stock"
              className="input p-3"
            />
            {errors.stock && (
              <p className="text-red-400">{errors.stock.message}</p>
            )}
          </div>
        </div>
        <CategoryTagsInput
          defaultCategoryTags={product.categories}
          categoryTags={categoryTags}
          setCategoryIds={setCategoryIds}
          notEnoughCategoriesError={notEnoughCategoriesError}
          setNotEnoughCategoriesError={setNotEnoughCategoriesError}
        />
      </section>
      <SubmitButton
        className="w-full p-3"
        disabled={isSubmitting}
        placeholder="Applying"
      >
        Apply
      </SubmitButton>
    </form>
  );
}
