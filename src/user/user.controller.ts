import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { Response, Request } from 'express';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async create(@Body('name') name: string, @Body('password') password: string) {
    const hashedPassword = await bcrypt.hash(password, 12);

    return this.userService.createUser({ name, password: hashedPassword });
  }

  @Post('login') // login
  async login(
    @Body('name') name: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.userService.findOne({ where: { name } });

    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Invalid password');
    }

    const token = await this.jwtService.signAsync({ id: user.id });

    response.cookie('token', token, { httpOnly: true });

    return {
      massage: 'success',
    };
  }

  @Get('users')
  async getUsers(@Req() request: Request) {
    try {
      const cookie = request.cookies['token'];
      const data = await this.jwtService.verifyAsync(cookie);
      if (!data) {
        throw new UnauthorizedException();
      }

      const user = await this.userService.findOne({ where: { id: data.id } });

      const { password, ...result } = user; // hide password from response

      return result;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('token');
    return {
      massage: 'logged out',
    };
  }
}
