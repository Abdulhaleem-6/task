import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { ConflictException, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashPassword } from '../utils/helpers.utils';
import * as bcrypt from 'bcrypt';

// Mock the hashpassword helper function
jest.mock('../utils/helpers.utils', () => ({
  hashPassword: jest.fn(),
}));

// Mock the bcrypt library
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  // Test the register-user service
  describe('registerUser', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const expectedUser = {
        id: 1,
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      };

      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrisma.user.create.mockResolvedValue(expectedUser);

      const result = await service.registerUser(registerDto);

      expect(hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          ...registerDto,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      const error = new Error('Unique constraint failed');
      error['code'] = 'P2002';

      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
      mockPrisma.user.create.mockRejectedValue(error);

      await expect(service.registerUser(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // Test the login user service
  describe('loginUser', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      isDeleted: false,
    };

    it('should successfully login a user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('jwt_token');

      const result = await service.loginUser(loginDto);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email, isDeleted: false },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        name: `${mockUser.firstName} ${mockUser.lastName}`,
      });
      expect(result).toEqual({ access_token: 'jwt_token' });
    });

    it('should throw HttpException with "User not found" when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        new HttpException('User not found', 404),
      );
    });

    it('should throw HttpException with "Invalid credentials" when password is invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        new HttpException('Invalid credentials', 401),
      );
    });
  });
});
