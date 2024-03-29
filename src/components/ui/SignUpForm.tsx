'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema } from '@/shared/schemas/user.schema';
import { CreateUserDto } from '@/shared/dtos/user.dto';

export default function SignUpForm() {
  const router = useRouter();
  const [displayConfirmPassword, setDisplayConfirmPassword] = useState(false);

  const [registerError, setRegisterError] = useState(false);
  const [somethingWentWrongError, setSomethingWentWrongError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserDto>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit: SubmitHandler<CreateUserDto> = async (data) => {
    setRegisterError(false);
    setSomethingWentWrongError(false);

    const signUpRes = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!signUpRes.ok) {
      setRegisterError(true);
      return;
    }

    const signInRes = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (signInRes?.ok && !signInRes.error) {
      return router.refresh();
    } else {
      setSomethingWentWrongError(true);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!displayConfirmPassword && value.length >= 6) {
      setDisplayConfirmPassword(true);
    }
  };

  return (
    <div className="flex max-w-sm flex-col gap-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-center gap-10"
      >
        <header className="w-full">
          <h1 className="text-2xl font-bold text-green-800">Register</h1>
        </header>
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col justify-center gap-2">
            <label htmlFor="fullname" className="text-green-800 opacity-75">
              Name
            </label>
            <input
              {...register('fullname')}
              id="fullname"
              type="text"
              placeholder="Enter your name"
              className="input-alternative p-4"
            />
            {errors.fullname && (
              <p className="text-red-400">{errors.fullname.message}</p>
            )}
          </div>
          <div className="flex flex-col justify-center gap-2">
            <label htmlFor="email" className="text-green-800 opacity-75">
              Email
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="Enter your email"
              className="input-alternative p-4"
            />
            {errors.email && (
              <p className="text-red-400">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col justify-center gap-2">
            <label htmlFor="password" className="text-green-800 opacity-75">
              Password
            </label>
            <input
              {...register('password')}
              id="password"
              type="password"
              placeholder="Enter your password"
              className="input-alternative p-4"
              onChange={handlePasswordChange}
            />
            {errors.password && (
              <p className="text-red-400">{errors.password.message}</p>
            )}
          </div>
          <div
            className={`${
              displayConfirmPassword ? 'flex' : 'hidden'
            } flex-col justify-center gap-2`}
          >
            <label
              htmlFor="confirmPassword"
              className="text-green-800 opacity-75"
            >
              Confirm password
            </label>
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              className="input-alternative p-4"
            />
            {errors.confirmPassword && (
              <p className="text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            {registerError && (
              <p className="text-red-400">User already exists</p>
            )}
            {somethingWentWrongError && (
              <p className="text-red-400">Something went wrong</p>
            )}
          </div>
        </div>
        <button type="submit" className="btn w-full p-3">
          Sign Up
        </button>
      </form>
      <div className="flex flex-col items-center justify-center text-green-800 opacity-75">
        <p>
          Do you already have an account?{' '}
          <Link
            href="sign-in"
            className="font-semibold transition hover:text-lime-700"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
