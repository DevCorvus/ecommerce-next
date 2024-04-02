import { AddressService } from './address/address.service';
import { AuthService } from './auth/auth.service';
import { CartService } from './cart/cart.service';
import { CategoryService } from './category/category.service';
import { CountryService } from './country/country.service';
import { OrderService } from './order/order.service';
import { PasswordService } from './password/password.service';
import { PaymentService } from './payment/payment.service';
import { ProductService } from './product/product.service';
import { ReviewService } from './review/review.service';
import { StorageService } from './storage/storage.service';
import { UserService } from './user/user.service';
import { WishedItemService } from './wished/wished.service';

export const passwordService = new PasswordService();
export const countryService = new CountryService();
export const productService = new ProductService();
export const cartService = new CartService(productService);
export const userService = new UserService(passwordService);
export const authService = new AuthService(userService, passwordService);
export const storageService = new StorageService('/public/uploads');
export const categoryService = new CategoryService();
export const wishedItemService = new WishedItemService(productService);
export const addressService = new AddressService();
export const orderService = new OrderService();
export const paymentService = new PaymentService(orderService);
export const reviewService = new ReviewService();
