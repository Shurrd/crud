import { TokensDto } from './tokens.dto';

export class AuthResponseDto {
  tokens: TokensDto;
  userId: number;
}
