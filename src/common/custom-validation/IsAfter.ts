/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import * as moment from 'moment';

export function IsAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<any, any>, propertyName: string) {
    registerDecorator({
      name: 'isAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (!moment(value).isValid() || !moment(relatedValue).isValid()) {
            return false;
          }

          return moment(value).isAfter(moment(relatedValue));
        },
      },
    });
  };
}
