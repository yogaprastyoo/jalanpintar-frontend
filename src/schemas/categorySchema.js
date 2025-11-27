/**
 * Category Validation Schema (Zod)
 * Validation untuk category/folder creation dan update
 */

import { z } from 'zod';

/**
 * Category/Folder Schema
 */
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Nama folder harus diisi')
    .max(50, 'Nama folder maksimal 50 karakter')
    .regex(
      /^[a-zA-Z0-9\s\-]+$/, 
      'Nama folder hanya boleh mengandung huruf, angka, spasi, dan tanda hubung'
    )
    .trim(),
  
  description: z.string()
    .max(200, 'Deskripsi maksimal 200 karakter')
    .optional()
    .or(z.literal('')),
  
  icon: z.string()
    .min(1, 'Icon harus dipilih'),
  
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Format warna harus hex valid (contoh: #FF0000)')
    .min(7, 'Format warna harus 7 karakter')
    .max(7, 'Format warna harus 7 karakter'),
});

/**
 * Validate category data
 * @param {Object} data - Category data to validate
 * @returns {Object} { success: boolean, data?: Object, errors?: Array }
 */
export const validateCategory = (data) => {
  try {
    const validData = categorySchema.parse(data);
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
 * Safe parse category (returns result without throwing)
 */
export const safeParseCategoryCategory = (data) => {
  return categorySchema.safeParse(data);
};

export default categorySchema;
