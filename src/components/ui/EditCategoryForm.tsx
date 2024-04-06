'use client';

import { useUpdateCategory } from '@/data/category';
import { toastError } from '@/lib/toast';
import {
  CategoryDto,
  CreateUpdateCategoryDto,
} from '@/shared/dtos/category.dto';
import { createUpdateCategorySchema } from '@/shared/schemas/category.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';

interface Props {
  category: CategoryDto;
  updateCategory(data: CategoryDto): void;
  close(): void;
}

export default function EditCategoryForm({
  category,
  updateCategory,
  close,
}: Props) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateUpdateCategoryDto>({
    resolver: zodResolver(createUpdateCategorySchema),
    defaultValues: {
      title: category.title,
      description: category.description,
    },
  });

  const updateCategoryMutation = useUpdateCategory();

  const onSubmit: SubmitHandler<CreateUpdateCategoryDto> = async (data) => {
    try {
      const updatedCategory = await updateCategoryMutation.mutateAsync({
        categoryId: category.id,
        data,
      });
      updateCategory(updatedCategory);
      close();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-md border-2 border-gray-50 bg-white p-6 shadow-md"
    >
      <header>
        <span className="text-xl font-bold text-green-800">
          Editing {category.title}
        </span>
      </header>
      <div className="flex flex-col gap-2">
        <label
          htmlFor={`title-${category.id}`}
          className="text-green-800 opacity-75"
        >
          Title
        </label>
        <input
          {...register('title')}
          type="text"
          id={`title-${category.id}`}
          placeholder="Enter category title"
          className="input p-3"
        />
        {errors.title && <p className="text-red-400">{errors.title.message}</p>}
        {updateCategoryMutation.isError && (
          <p className="text-red-400">Already taken</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor={`description-${category.id}`}
          className="text-green-800 opacity-75"
        >
          Description (optional)
        </label>
        <textarea
          {...register('description')}
          id={`description-${category.id}`}
          className="textarea p-3"
          placeholder="Enter category description"
        ></textarea>
        {errors.description && (
          <p className="text-red-400">{errors.description.message}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button type="submit" className="btn px-5 py-2">
          Apply
        </button>
        <button
          type="button"
          onClick={close}
          className="btn-alternative px-5 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
