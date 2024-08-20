import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './common/guards';
import { RequestWithId } from 'src/types';
import { UserService } from 'src/users/user.service'; // Adjust import path

@UseGuards(AuthGuard)
@Controller()
export class AppController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  async getHello(@Req() req: RequestWithId) {
    const user = await this.usersService.getUserById(req.id);

    return {
      message: 'Accessed Resource',
      user,
    };
  }
}
