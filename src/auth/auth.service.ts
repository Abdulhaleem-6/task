import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword } from '../utils/helpers.utils';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginResponse, UserPayload } from './interface/user-login.interface';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  // User Registration
  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, password, ...userData } = registerUserDto;

    try {
      // Step 1: Hash the password
      const hashedPassword = await hashPassword(password);

      // Step 3: Save user with hashed password
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          ...userData,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email or slug already exists');
      }
      throw error;
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    try {
      // Step 1: Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: loginUserDto.email, isDeleted: false },
      });

      // Step 2: Check if user exists
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Step 3: Verify password
      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Step 4: Create JWT payload
      const payload: UserPayload = {
        sub: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      };

      // Step 5: Sign and return JWT token
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || 500,
      );
    }
  }
}
