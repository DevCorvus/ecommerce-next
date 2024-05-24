'use client';

import Image from 'next/image';
import OrderStatusTag from '@/components/ui/OrderStatusTag';
import { formatDate } from '@/utils/formatDate';
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { OrderDto } from '@/shared/dtos/order.dto';
import { formatMoney } from '@/lib/dinero';
import { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import PaymentStatusTag from './PaymentStatusTag';
import Link from 'next/link';
import { useConfirmDelivery } from '@/data/order';
import { toastError } from '@/lib/toast';

interface Props {
  order: OrderDto;
}

export default function OrderDetails({ order }: Props) {
  const router = useRouter();

  const confirmDeliveryMutation = useConfirmDelivery();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await confirmDeliveryMutation.mutateAsync(order.id);
      router.refresh();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className="w-full max-w-md space-y-10 rounded-lg bg-white p-8 text-slate-700 shadow-md">
      <div className="space-y-10">
        <header className="text-2xl font-bold text-cyan-700">
          <h2 className="flex items-center justify-between gap-2">
            Placing order
            <OrderStatusTag status={order.status} className="text-lg" />
          </h2>
        </header>
        <section className="text-sm">
          <table>
            <tbody>
              <tr>
                <th className="px-2 py-0.5 text-left">ID</th>
                <td>
                  <span className="rounded-md bg-slate-50 px-1 py-0.5 shadow-sm">
                    {order.id}
                  </span>
                </td>
              </tr>
              <tr>
                <th className="px-2 py-0.5 text-left">Date</th>
                <td>
                  <p className="flex items-center gap-1 px-1 py-0.5">
                    <span>{formatDate(new Date(order.createdAt))}</span>
                    <HiOutlineQuestionMarkCircle
                      className="text-cyan-700"
                      title="MM/DD/YYYY"
                    />
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className="space-y-2">
          <header className="flex items-center justify-between text-lg font-semibold text-cyan-700">
            <h3>Shipping address</h3>
          </header>
          <div>
            <p className="rounded-lg bg-slate-50/75 p-3 shadow-md">
              {order.address.nickname}
            </p>
          </div>
        </section>
        <section className="space-y-2">
          <header className="text-lg font-semibold text-cyan-700">
            <h3>Payment method</h3>
          </header>
          <p className="flex items-center justify-between rounded-lg bg-slate-50/75 p-2.5 shadow-md">
            {order.payment.method}
            <PaymentStatusTag
              status={order.payment.status}
              className="border border-slate-100"
            />
          </p>
        </section>
        {order.shipment && (
          <section className="flex flex-col gap-2">
            <header className="text-lg font-semibold text-cyan-700">
              <h3>Shipment</h3>
            </header>
            <p className="flex items-center justify-between rounded-lg bg-slate-50/75 p-2.5 shadow-md">
              Status
              <span className="rounded-md border border-slate-100 bg-green-100 px-1.5 py-0.5 font-medium text-green-500">
                {order.shipment.status.replace(/_/g, ' ')}
              </span>
            </p>
          </section>
        )}
        <section className="space-y-2">
          <header className="text-lg font-semibold text-cyan-700">
            <h3>Items</h3>
          </header>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-2 rounded-md bg-slate-50/75 shadow-md"
            >
              <Link
                href={`/items/${item.id}`}
                className="relative h-20 w-20 rounded-l-md bg-neutral-100"
              >
                <Image
                  src={'/images/' + item.image.path}
                  alt={item.title}
                  fill={true}
                  sizes="100px"
                  className="rounded-md object-contain"
                />
              </Link>
              <section className="flex flex-1 flex-col justify-around p-1">
                <div>
                  <p>{item.title}</p>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <p>
                    <span className="text-slate-500">Amount</span>{' '}
                    <span className="rounded-xl bg-slate-100 px-1 font-medium text-slate-600 shadow-sm">
                      {item.amount}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500">Price</span>{' '}
                    <span className="rounded-xl bg-slate-100 px-1 font-medium text-slate-600 shadow-sm">
                      {formatMoney(item.price)}
                    </span>
                  </p>
                </div>
              </section>
            </div>
          ))}
        </section>
      </div>
      <div className="flex w-full flex-col gap-10">
        <section className="flex flex-col gap-2">
          <header className="text-lg font-semibold text-cyan-700">
            <h3>Summary</h3>
          </header>
          <div className="flex flex-col gap-3 rounded-lg bg-slate-50/75 p-6 shadow-md">
            <div className="flex flex-col gap-1">
              <p className="flex justify-between">
                Total items cost{' '}
                <span className="font-medium">{formatMoney(order.total)}</span>
              </p>
              <p className="flex justify-between">
                Shipping cost{' '}
                <span className="font-medium">{formatMoney(0)}</span>
              </p>
            </div>
            <hr />
            <p className="flex items-center justify-between font-bold">
              Total
              <span className="rounded-xl bg-slate-100 px-1 py-0.5 text-lg font-semibold shadow-sm">
                {formatMoney(order.total)}
              </span>
            </p>
          </div>
        </section>
      </div>
      {order.status === 'SHIPPED' && (
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            className="btn flex w-full items-center justify-center gap-2 p-3"
          >
            <HiOutlineCheckCircle className="text-xl" />
            Confirm Delivery
          </button>
        </form>
      )}
    </div>
  );
}
