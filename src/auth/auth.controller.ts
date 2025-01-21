import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponse } from './interface/user-login.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async registerUser(@Body() data: RegisterUserDto) {
    return await this.authService.registerUser(data);
  }

  @Public()
  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto): Promise<LoginResponse> {
    return await this.authService.loginUser(loginUserDto);
  }

  @ApiBearerAuth()
  @Get('me')
  async me(@Request() req) {
    return req.user;
  }
}
