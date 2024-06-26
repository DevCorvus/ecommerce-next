import { z } from 'zod';
import {
  createUserSchema,
  loginUserSchema,
  updateUserPasswordSchema,
} from '@/shared/schemas/user.schema';
import { RoleType } from '@/shared/auth/rbac';

export type LoginUserDto = z.infer<typeof loginUserSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserPasswordDto = z.infer<typeof updateUserPasswordSchema>;

export interface UserProfileDto {
  fullname: string;
  email: string;
  role: RoleType;
  createdAt: Date;
  updatedAt: Date;
}
