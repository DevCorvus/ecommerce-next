'use client';

import { useUpdateCategory } from '@/data/category';
import { useClickOutside } from '@/hooks/useClickOutside';
import { toastError } from '@/lib/toast';
import {
  CategoryDto,
  CreateUpdateCategoryDto,
} from '@/shared/dtos/category.dto';
import { createUpdateCategorySchema } from '@/shared/schemas/category.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import Modal from './Modal';
import SubmitButton from './SubmitButton';

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
    formState: { errors, isSubmitting },
    watch,
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

  const ref = useClickOutside<HTMLFormElement>(close);

  const description = watch('description');

  return (
    <Modal>
      <form
        ref={ref}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-lg border-2 border-neutral-100 bg-white p-6 shadow-md"
      >
        <header>
          <span className="text-xl font-semibold text-cyan-700">
            Editing {category.title}
          </span>
        </header>
        <div className="space-y-1">
          <label htmlFor={`title-${category.id}`} className="text-slate-500">
            Title
          </label>
          <input
            {...register('title')}
            type="text"
            id={`title-${category.id}`}
            placeholder="Enter category title"
            className="input p-3"
            autoFocus
          />
          {errors.title && (
            <p className="text-red-400">{errors.title.message}</p>
          )}
          {updateCategoryMutation.isError && (
            <p className="text-red-400">Already taken</p>
          )}
        </div>
        <div className="space-y-1">
          <label
            htmlFor={`description-${category.id}`}
            className="text-slate-500"
          >
            Description (optional)
          </label>
          <div>
            <textarea
              {...register('description')}
              id={`description-${category.id}`}
              className="textarea p-3"
              placeholder="Enter category description"
            />
            <span className="block text-right text-xs text-slate-500/50">
              ({description.length}/300)
            </span>
          </div>
          {errors.description && (
            <p className="text-red-400">{errors.description.message}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SubmitButton
            className="px-5 py-2"
            disabled={isSubmitting}
            placeholder="Applying"
          >
            Apply
          </SubmitButton>
          <button
            type="button"
            onClick={close}
            className="btn-alternative px-3 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
