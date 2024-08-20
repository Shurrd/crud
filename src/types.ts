import { Request } from 'express';
import { Users } from './entities';

export type IsUniqueProps = {
  tableName: string;
  columnName: string;
};

export interface RequestWithId extends Request {
  id: number;
}

export interface TokenPayload {
  id: number;
}
