import { categoryService } from '@/server/services';
import { CreateUpdateCategoryDto } from '@/shared/dtos/category.dto';
import { createUpdateCategorySchema } from '@/shared/schemas/category.schema';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const json = await req.json();
  const result = await createUpdateCategorySchema.safeParseAsync(json);

  if (!result.success) {
    return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
  }

  const data: CreateUpdateCategoryDto = result.data;

  try {
    const newCategoryTag = await categoryService.create(data);

    return NextResponse.json(
      { message: 'Category created successfully', data: newCategoryTag },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Category already exists' },
      { status: 409 },
    );
  }
}
