import { z } from 'zod';
import { hashIdPost } from '@app/helpers/hashids';

export class PostValidation {
  static GETBYUSER = z.object({
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
      .enum(['id', 'status', 'created_at', 'updated_at'], {
        message:
          'Order_by must be one of id, status, created_at, or updated_at',
      })
      .default('id'),
    order: z
      .enum(['asc', 'desc'], {
        message: 'Order must be either asc or desc',
      })
      .default('desc'),
  });

  static GET = z.object({
    hash_id: z.string().refine((val) => {
      try {
        const decoded = hashIdPost.decode(val);
        return decoded.length > 0 && Number.isInteger(decoded[0]);
      } catch {
        return false;
      }
    }, 'Invalid hashId'),
  });

  static CREATE = z.object({
    title: z
      .string({
        required_error: 'Title required',
      })
      .min(1, 'Title must be at least 1 characters')
      .max(255, 'Title max 255 characters'),
    content: z.string().optional(),
    status: z
      .enum(['draf', 'publish'], {
        message: 'Status must be either draf or publish',
      })
      .default('publish'),
  });

  static UPDATE = z.object({
    title: z
      .string()
      .min(1, 'Title must be at least 1 characters')
      .max(255, 'Title max 255 characters')
      .optional(),
    content: z.string().optional(),
    status: z
      .enum(['draf', 'publish'], {
        message: 'Status must be either draf or publish',
      })
      .default('publish'),
    hash_id: z.string().refine((val) => {
      try {
        const decoded = hashIdPost.decode(val);
        return decoded.length > 0 && Number.isInteger(decoded[0]);
      } catch {
        return false;
      }
    }, 'Invalid hashId'),
  });

  static DELETE = z.object({
    hash_id: z.string().refine((val) => {
      try {
        const decoded = hashIdPost.decode(val);
        return decoded.length > 0 && Number.isInteger(decoded[0]);
      } catch {
        return false;
      }
    }, 'Invalid hashId'),
  });
}
