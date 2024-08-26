import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { RoleGuard, JwtAuthGuard } from 'src/common/guards';
import { CurrentUser, Roles } from 'src/common/decorators';
import { Role } from 'src/common/enums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Users } from 'src/entities';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('active/profile')
  async getProfile(@CurrentUser() user: Users) {
    return await this.userService.getUserById(user.id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  async getUserById(@Param('id') id: number) {
    return await this.userService.getUserById(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string) {
    return await this.userService.getUserbyEmail(email);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('user/:id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: Users,
  ) {
    if (user.id === +id || user.role === 'admin') {
      return await this.userService.updateUser(id, updateUserDto);
    }
    throw new ForbiddenException('You are not allowed to update this user');
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Delete('user/:id')
  async deleteUser(@Param('id') id: number) {
    return await this.userService.deleteUser(id);
  }
}
