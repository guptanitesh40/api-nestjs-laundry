import { Transform } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export function applyNumberArrayValidation(isStringArray: boolean = false) {
  return function (target: any, propertyKey: string) {
    if (isStringArray) {
      Transform(({ value }) =>
        Array.isArray(value) ? value.map(String) : [String(value)],
      )(target, propertyKey);
      IsOptional()(target, propertyKey);
      IsArray()(target, propertyKey);
      ArrayMinSize(1)(target, propertyKey);
      IsString({ each: true })(target, propertyKey);
    } else {
      Transform(({ value }) =>
        Array.isArray(value) ? value.map(Number) : [Number(value)],
      )(target, propertyKey);

      IsOptional()(target, propertyKey);
      IsArray()(target, propertyKey);
      ArrayMinSize(1)(target, propertyKey);
      IsNumber({}, { each: true })(target, propertyKey);
    }
  };
}
