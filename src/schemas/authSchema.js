/**
 * Auth Validation Schemas (Zod)
 * Validation untuk login dan register forms
 */

import { z } from 'zod';

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email harus diisi')
    .email('Email tidak valid')
    .max(255, 'Email terlalu panjang')
    .trim()
    .toLowerCase(),
  
  password: z.string()
    .min(1, 'Password harus diisi')
    .min(6, 'Password minimal 6 karakter'),
});

/**
 * Register Schema
 */
export const registerSchema = z.object({
  name: z.string()
    .min(1, 'Nama harus diisi')
    .max(100, 'Nama maksimal 100 karakter')
    .trim(),
  
  email: z.string()
    .min(1, 'Email harus diisi')
    .email('Email tidak valid')
    .max(255, 'Email terlalu panjang')
    .trim()
    .toLowerCase(),
  
  password: z.string()
    .min(6, 'Password minimal 6 karakter')
    .max(255, 'Password terlalu panjang')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z]|.*\d)/,
      'Password harus mengandung huruf besar atau angka'
    ),
  
  password_confirmation: z.string()
    .min(1, 'Konfirmasi password harus diisi'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Password dan konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

/**
 * Validate login data
 */
export const validateLogin = (data) => {
  try {
    const validData = loginSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Validation error occurred' }],
    };
  }
};

/**
 * Validate register data
 */
export const validateRegister = (data) => {
  try {
    const validData = registerSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Validation error occurred' }],
    };
  }
};

export default { loginSchema, registerSchema, validateLogin, validateRegister };
