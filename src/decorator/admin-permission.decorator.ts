import { SetMetadata } from '@nestjs/common';

export const ADMIN_PERMISSION_KEY = 'admin_permission';

export const AdminPermission = (
  module_id: number,
  permissions: {
    create?: boolean;
    update?: boolean;
    read?: boolean;
    delete?: boolean;
  },
) => SetMetadata(ADMIN_PERMISSION_KEY, { module_id, ...permissions });
