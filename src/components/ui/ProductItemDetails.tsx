'use client';
import Image from 'next/image';
import { useState } from 'react';
import { HiShoppingCart } from 'react-icons/hi2';
import WishProduct from './WishProduct';
interface Props {
  id: string;
  images: string[];
  name: string;
  price: string;
  description: string;
  stock: number;
  createdAt: string;
  tags: string[];
}

export default function ProductItemDetails({
  id,
  images,
  name,
  price,
  description,
  stock,
  createdAt,
  tags,
}: Props) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full h-96 relative flex flex-col gap-2">
        <div className="relative h-4/5 bg-neutral-100 shadow-md rounded-md">
          <Image
            src={selectedImage}
            fill={true}
            objectFit="contain"
            alt={`${name} selected image`}
            className="rounded-md p-1"
          />
        </div>
        <div className="flex-1 flex gap-1">
          {images.map((url, i) => (
            <button
              className={`relative w-20 h-full border rounded bg-neutral-100 ${
                selectedImage === url
                  ? 'border-green-500'
                  : 'border-neutral-300'
              }`}
              key={i}
              onClick={() => {
                setSelectedImage(url);
              }}
            >
              <Image
                src={url}
                alt={`${name} image #${i + 1}`}
                fill={true}
                objectFit="contain"
              />
            </button>
          ))}
        </div>
        <div className="absolute top-2 right-2 z-10 text-3xl">
          <WishProduct />
        </div>
      </div>
      <div className="text-2xl w-full flex justify-between font-bold">
        <header>
          <h1 className="uppercase">{name}</h1>
        </header>
        <p className="justify-start align-top">$ {price}</p>
      </div>
      <section className="w-full flex flex-col justify-between gap-6">
        <p>{description}</p>
        <div className="w-full flex justify-between text-green-950 opacity-60">
          <p>{stock} in stock</p>
          <p>Created at {createdAt}</p>
        </div>
        <div className="w-full flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="bg-green-100 text-green-600 rounded-full text-xs px-2 py-1  "
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
      <button className="w-full bg-green-800 text-lime-50 px-4 py-4 rounded-full flex gap-2 items-center justify-center">
        <HiShoppingCart />
        Add to shopping cart
      </button>
    </div>
  );
}
