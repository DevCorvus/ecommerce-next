import './globals.css';
import type { Metadata } from 'next';
import { Merriweather } from 'next/font/google';
import AuthProvider from '@/components/providers/AuthProvider';
import NavBar from '@/components/ui/NavBar';
import UserProvider, { UserData } from '@/components/providers/UserProvider';
import { getServerSession } from 'next-auth';
import { nextAuthOptions } from '@/server/auth/next-auth.config';
import { cartService, wishedItemService } from '@/server/services';

const merriweather = Merriweather({
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'eCommerce Next',
  description: 'Generated by create next app',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(nextAuthOptions);

  let userData: UserData | null = null;

  if (session) {
    userData = {
      cartItemIds: (await cartService.findAllItemIds(session.user.cartId))!,
      wishedItemIds: (await wishedItemService.findAllIds(session.user.id))!,
    };
  }

  return (
    <html lang="en" className={merriweather.className}>
      <body className="relative bg-neutral-50">
        <AuthProvider session={session}>
          <UserProvider data={userData}>
            <NavBar />
            <main className="min-h-screen w-full bg-amber-50">{children}</main>
            <div id="modal-container"></div>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
