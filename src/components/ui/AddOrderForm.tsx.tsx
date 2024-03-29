'use client';

import { NewOrderDto } from '@/shared/dtos/order.dto';
import { useClickOutside } from '@/hooks/useClickOutside';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';
import Image from 'next/image';
import { formatMoney } from '@/lib/dinero';
import { CreatePaymentDto } from '@/shared/dtos/payment.dto';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPaymentSchema } from '@/shared/schemas/payment.schema';
import { ImSpinner8 } from 'react-icons/im';
import { formatDate } from '@/utils/formatDate';
import OrderStatusTag from './OrderStatusTag';
import Link from 'next/link';
import Modal from './Modal';
import { useEffect, useState } from 'react';
import { AddressMinimalDto } from '@/shared/dtos/address.dto';
import LoadingModal from './LoadingModal';

interface Props {
  order: NewOrderDto;
  close(): void;
}

export default function AddOrderForm({ order, close }: Props) {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<AddressMinimalDto[]>([]);

  const ref = useClickOutside<HTMLFormElement>(close);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/addresses?minimal=true');

      if (res.ok) {
        const data: AddressMinimalDto[] = await res.json();
        setAddresses(data);
      }

      setLoading(false);
    })();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePaymentDto>({
    resolver: zodResolver(createPaymentSchema),
  });

  const onSubmit: SubmitHandler<CreatePaymentDto> = async (data) => {
    const res = await fetch(`/api/orders/${order.id}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push(`/account/orders/${order.id}`);
    }
  };

  if (isLoading) return <LoadingModal />;

  return (
    <Modal>
      <form
        ref={ref}
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-10 overflow-y-auto border-2 border-gray-50 bg-white p-10 shadow-md lg:container lg:flex-row lg:rounded-lg lg:p-12"
      >
        <div className="flex flex-1 flex-col gap-10">
          <header className="text-2xl font-bold text-green-800">
            <h2 className="flex items-center gap-2">
              Placing order
              <OrderStatusTag status={order.status} className="text-lg" />
            </h2>
          </header>
          <section className="flex flex-col gap-1 text-sm">
            <p>
              <strong>ID</strong>{' '}
              <span className="rounded-md bg-slate-100 px-1 py-0.5">
                {order.id}
              </span>
            </p>
            <p>
              <strong>Date</strong> {formatDate(new Date(order.createdAt))}{' '}
              <HiOutlineQuestionMarkCircle
                className="inline-block text-green-800"
                title="MM/DD/YYYY"
              />
            </p>
          </section>
          <section className="flex flex-col gap-2">
            <header className="text-lg font-bold text-green-800">
              <h3>Shipping address</h3>
            </header>
            <div>
              <select
                className="input p-3"
                {...register('address')}
                defaultValue={
                  addresses.find((address) => address.default)?.id || ''
                }
              >
                <option value="" disabled>
                  Select address
                </option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.nickname + (address.default ? ' (Default)' : '')}
                  </option>
                ))}
              </select>
              {errors.address && (
                <p className="text-red-400">{errors.address.message}</p>
              )}
            </div>
          </section>
          <section className="flex flex-col gap-2">
            <header className="text-lg font-bold text-green-800">
              <h3>Payment method</h3>
            </header>
            <div>
              <select
                className="input p-3"
                {...register('method')}
                defaultValue=""
              >
                <option value="" disabled>
                  Select payment method
                </option>
                <option value="BISON">BISON</option>
                <option value="HUMBLECARD">HumbleCard</option>
                <option value="PAYMATE">PayMate</option>
              </select>
              {errors.method && (
                <p className="text-red-400">{errors.method.message}</p>
              )}
            </div>
          </section>
          <section className="flex flex-col gap-2">
            <header className="text-lg font-bold text-green-800">
              <h3>Items</h3>
            </header>
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex gap-2 rounded-md bg-slate-100 shadow-md"
              >
                <Link
                  href={`/items/${item.id}`}
                  className="relative h-20 w-20 rounded-l-md bg-slate-200"
                >
                  <Image
                    src={'/uploads/' + item.image.path}
                    alt={item.title}
                    fill={true}
                    className="rounded-md object-contain"
                  />
                </Link>
                <section className="flex flex-1 flex-col justify-around p-1">
                  <div>
                    <p>{item.title}</p>
                    <p className="line-clamp-1 font-sans text-sm opacity-70">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p>
                      <span className="text-slate-500">Price</span>{' '}
                      <span className="rounded-md bg-green-100 px-1 py-0.5 text-green-800">
                        {formatMoney(item.price)}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-500">Quantity</span>{' '}
                      <span className="rounded-md bg-green-100 px-1 py-0.5 text-green-800">
                        {item.amount}
                      </span>
                    </p>
                  </div>
                </section>
              </div>
            ))}
          </section>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-10">
          <section className="flex flex-col gap-2">
            <header className="text-lg font-bold text-green-800">
              <h3>Summary</h3>
            </header>
            <div className="input flex flex-col gap-3 p-6">
              <div className="flex flex-col gap-1">
                <p className="flex justify-between">
                  Total items cost <span>{formatMoney(order.total)}</span>
                </p>
                <p className="flex justify-between">
                  Shipping cost <span>{formatMoney(0)}</span>
                </p>
              </div>
              <hr />
              <p className="flex justify-between font-bold">
                Total
                <strong className="text-green-800">
                  {formatMoney(order.total)}
                </strong>
              </p>
            </div>
          </section>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="btn flex items-center gap-2 px-3 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <ImSpinner8 className="animate-spin" />}
              Place order
            </button>
            <button
              type="button"
              onClick={close}
              className="btn-alternative px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
