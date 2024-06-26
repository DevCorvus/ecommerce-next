import { productService } from '@/server/services';
import { idsArrayFromSeachParamsSchema } from '@/shared/schemas/params.schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const items = searchParams.get('items');

  const result = await idsArrayFromSeachParamsSchema.safeParseAsync(items);

  if (!result.success) {
    return NextResponse.json(null, { status: 400 });
  }

  const cartItemIds = result.data;

  try {
    const cartItems = await productService.findAllAsCartItems(cartItemIds);
    return NextResponse.json(cartItems, { status: 200 });
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
