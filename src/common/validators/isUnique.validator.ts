import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { IsUniqueProps } from 'src/types';

@Injectable()
@ValidatorConstraint({
  name: 'isUniqueValidator',
  async: true,
})
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}
  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    const { tableName, columnName }: IsUniqueProps = args?.constraints[0];

    const dataExists = await this.entityManager
      .getRepository(tableName)
      .createQueryBuilder(tableName)
      .where({ [columnName]: value })
      .getExists();

    return !dataExists;
  }
  defaultMessage?(args?: ValidationArguments): string {
    const field: string = args.property;
    return 'User with this email already exists';
  }
}
