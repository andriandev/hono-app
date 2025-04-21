import { z } from 'zod';

export class LinkValidation {
  static CREATE = z.object({
    alias: z
      .string()
      .min(4, 'Alias must be at least 4 characters')
      .max(60, 'Alias max 60 characters')
      .optional(),
    destination: z
      .string()
      .url('Destination must be valid url')
      .max(350, 'Destination max 350 characters'),
  });

  static UPDATE = z.object({
    alias: z
      .string()
      .min(4, 'Alias must be at least 4 characters')
      .max(60, 'Alias max 60 characters')
      .optional(),
    destination: z
      .string()
      .url('Destination must be valid url')
      .max(350, 'Destination max 350 characters')
      .optional(),
  });

  static GET = z.object({
    limit: z.coerce
      .number({
        invalid_type_error: 'Limit must be a number',
      })
      .min(1)
      .optional(),
    offset: z.coerce
      .number({
        invalid_type_error: 'Offset must be a number',
      })
      .min(0)
      .optional(),
    order_by: z
      .enum(['id', 'view', 'created_at'], {
        message: 'Order_by must be one of id, view, or created_at',
      })
      .default('id'),
    order: z
      .enum(['asc', 'desc'], {
        message: 'Order must be either asc or desc',
      })
      .default('desc'),
  });
}
