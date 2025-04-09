import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class NullTransformInterceptor implements NestInterceptor {
  private transform(data: any): any {
    const numericKeys = [
      'created_by_user_id',
      'vendor_id',
      'workshop_id',
      'kasar_amount',
      'coupon_discount',
      'commission_percentage',
      'security_deposit',
      'delivery_boy_id',
      'pickup_boy_id',
      'branch_id',
      'express_delivery_charges',
    ];

    const nullKeys = ['next_step', 'feedback', 'data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.transform(item));
    } else if (data !== null && typeof data === 'object') {
      const transformed: any = {};

      for (const key in data) {
        if (data[key] === null) {
          transformed[key] = numericKeys.includes(key)
            ? 0
            : nullKeys.includes(key)
              ? null
              : '';
        } else if (data[key] instanceof Date && !isNaN(data[key].getTime())) {
          transformed[key] = data[key].toISOString();
        } else if (typeof data[key] === 'object') {
          transformed[key] = this.transform(data[key]);
        } else {
          transformed[key] = data[key];
        }
      }
      return transformed;
    }
    return data;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }
}
