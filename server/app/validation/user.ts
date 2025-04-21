import { z } from 'zod';

export class UserValidation {
  static REGISTER = z.object({
    username: z
      .string({
        required_error: 'Username is required',
      })
      .min(3, 'Username must be at least 3 characters')
      .max(100, 'Username max 100 characters'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(3, 'Password must be at least 3 characters')
      .max(100, 'Password max 100 characters'),
  });

  static LOGIN = z.object({
    username: z
      .string({
        required_error: 'Username is required',
      })
      .min(3, 'Username must be at least 3 characters')
      .max(100, 'Username max 100 characters'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(3, 'Password must be at least 3 characters')
      .max(100, 'Password max 100 characters'),
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
  });

  static CREATE = z.object({
    username: z
      .string({
        required_error: 'Username is required',
      })
      .min(3, 'Username must be at least 3 characters')
      .max(100, 'Username max 100 characters'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(3, 'Password must be at least 3 characters')
      .max(100, 'Password max 100 characters'),
    role: z.enum(['admin', 'member', 'banned']).optional(),
    is_active: z.boolean().optional(),
  });

  static UPDATE = z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(100, 'Username max 100 characters')
      .optional(),
    password: z
      .string()
      .min(3, 'Password must be at least 3 characters')
      .max(100, 'Password max 100 characters')
      .optional(),
    role: z.enum(['admin', 'member', 'banned']).optional(),
    is_active: z.boolean().optional(),
  });

  static ACTIVATE = z.object({
    id: z.coerce
      .number({
        required_error: 'Id is required',
        invalid_type_error: 'Id must be a number',
      })
      .min(1, 'Username must be at least 1 characters'),
    is_active: z.boolean({
      required_error: 'is_active is required',
    }),
  });
}
