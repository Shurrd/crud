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
import { AuthGuard } from 'src/common/guards';
import { RequestWithId } from 'src/types';

@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(@Req() req: RequestWithId) {
    const loggedInUser = await this.userService.getUserById(req.id);

    const users = await this.userService.getAllUsers();

    return {
      loggedInUser,
      users,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: number, @Req() req: RequestWithId) {
    const loggedInUser = await this.userService.getUserById(req.id);

    const user = await this.userService.getUserById(id);

    return {
      loggedInUser,
      user,
    };
  }

  @Get('email/:email')
  async getUserByEmail(
    @Param('email') email: string,
    @Req() req: RequestWithId,
  ) {
    const loggedInUser = await this.userService.getUserById(req.id);

    const user = await this.userService.getUserbyEmail(email);

    return {
      loggedInUser,
      user,
    };
  }

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req: RequestWithId,
  ) {
    const loggedInUser = await this.userService.getUserById(req.id);

    const newUser = await this.userService.createUser(createUserDto);

    return {
      loggedInUser,
      newUser,
    };
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithId,
  ) {
    const loggedInUser = await this.userService.getUserById(req.id);

    const updatedUser = await this.userService.updateUser(id, updateUserDto);

    return {
      loggedInUser,
      updatedUser,
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number, @Req() req: RequestWithId) {
    const loggedInUser = await this.userService.getUserById(req.id);

    const result = await this.userService.deleteUser(id);

    return {
      loggedInUser,
      result,
    };
  }
}
