import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { LoginDto, RefreshTokenDto, SignupDto } from './dtos';
import { AuthService } from './auth.service';
import { RequestWithId } from 'src/types';
import { AuthGuard } from 'src/common/guards';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signupDto: SignupDto) {
    return this.authService.signUp(signupDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logOut(@Req() req: RequestWithId) {
    return this.authService.logout(req.id);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }
}
