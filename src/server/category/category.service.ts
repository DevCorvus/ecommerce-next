import { prisma } from '@/lib/prisma';
import {
  CategoryDto,
  CategoryTagDto,
  CategoryWithProductsDto,
  CreateUpdateCategoryDto,
} from '@/shared/dtos/category.dto';

export class CategoryService {
  findAll(title: string = ''): Promise<CategoryDto[]> {
    return prisma.category.findMany({
      where: { title: { startsWith: title } },
      orderBy: {
        title: 'asc',
      },
    });
  }

  findAllTags(title: string = ''): Promise<CategoryTagDto[]> {
    return prisma.category.findMany({
      where: { title: { startsWith: title } },
      select: { id: true, title: true },
    });
  }

  async findByIdWithProducts(
    id: number,
  ): Promise<CategoryWithProductsDto | null> {
    return prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            images: {
              take: 1,
              select: {
                path: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  create(data: CreateUpdateCategoryDto): Promise<CategoryDto> {
    return prisma.category.create({
      data,
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(
    id: number,
    data: CreateUpdateCategoryDto,
  ): Promise<CategoryDto> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    await prisma.category.delete({
      where: { id },
    });
  }
}
