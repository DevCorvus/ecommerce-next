import { formatMoney } from '@/lib/dinero';
import { ProductCardDto } from '@/shared/dtos/product.dto';
import Image from 'next/image';
import Link from 'next/link';
import Rating from './Rating';
import { useMemo } from 'react';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

interface Props {
  product: ProductCardDto;
}

export default function ProductRelatedItem({ product }: Props) {
  const isNew = useMemo(() => {
    const createdAt = new Date(product.createdAt);
    const createdAtInMs = createdAt.getTime();
    return Date.now() < createdAtInMs + ONE_WEEK;
  }, [product.createdAt]);

  return (
    <Link
      href={'/items/' + product.id}
      key={product.id}
      className="group relative flex flex-col rounded-lg border-b-2 border-neutral-100 bg-white shadow-md"
    >
      {isNew && (
        <span className="absolute -left-3 -top-3 z-10 rounded-md border border-cyan-600 bg-cyan-50 p-1 text-xs font-semibold text-cyan-600 shadow-md">
          New
        </span>
      )}
      <div className="relative h-28 w-full overflow-hidden rounded-t-lg bg-neutral-100 shadow-inner">
        <Image
          src={'/images/' + product.images[0].path}
          alt={product.title}
          fill={true}
          sizes="200px"
          className="object-cover transition duration-300 group-hover:scale-110"
        />
      </div>
      <section className="relative flex flex-1 flex-col gap-1 p-2">
        <header className="flex items-center justify-between gap-0.5 capitalize">
          <h2
            className="line-clamp-1 text-sm font-medium text-slate-700"
            title={product.title}
          >
            {product.title}
          </h2>
          <span className="rounded-xl bg-green-50 px-1 font-semibold text-green-600 shadow-sm">
            {formatMoney(product.price)}
          </span>
        </header>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <p>
            <span className="font-medium">{product.sales}</span> sold
          </p>
          <div className="text-xs">
            <Rating score={product.rating.score} />
          </div>
        </div>
      </section>
    </Link>
  );
}
