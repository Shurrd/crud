import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { AuthGuard, RoleGuard } from 'src/common/guards';
import { RequestWithUser } from 'src/types';
import { Roles } from 'src/common/decorators';
import { Role } from 'src/common/enums';

@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Get()
  async getAllUsers(@Req() req: RequestWithUser) {
    const loggedInUser = await this.userService.getUserById(req.user.id);

    const users = await this.userService.getAllUsers();

    return {
      loggedInUser,
      users,
    };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req: RequestWithUser) {
    const loggedInUser = await this.userService.getUserById(req.user.id);
    return { loggedInUser };
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: number, @Req() req: RequestWithUser) {
    const loggedInUser = await this.userService.getUserById(req.user.id);

    const user = await this.userService.getUserById(id);

    return {
      loggedInUser,
      user,
    };
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Get('email/:email')
  async getUserByEmail(
    @Param('email') email: string,
    @Req() req: RequestWithUser,
  ) {
    const loggedInUser = await this.userService.getUserById(req.user.id);

    const user = await this.userService.getUserbyEmail(email);

    return {
      loggedInUser,
      user,
    };
  }

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req: RequestWithUser,
  ) {
    const loggedInUser = await this.userService.getUserById(req.user.id);

    const newUser = await this.userService.createUser(createUserDto);

    return {
      loggedInUser,
      newUser,
    };
  }

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    const loggedInUser = await this.userService.getUserById(req.user.id);

    const updatedUser = await this.userService.updateUser(id, updateUserDto);

    return {
      loggedInUser,
      updatedUser,
    };
  }

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: number, @Req() req: RequestWithUser) {
    const loggedInUser = await this.userService.getUserById(req.user.id);

    const result = await this.userService.deleteUser(id);

    return {
      loggedInUser,
      result,
    };
  }
}
