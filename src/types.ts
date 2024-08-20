import { Request } from 'express';
import { Users } from './entities';

export type IsUniqueProps = {
  tableName: string;
  columnName: string;
};

export interface RequestWithUser extends Request {
  user: Users;
}

export interface TokenPayload {
  id: number;
}
