import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockRequest = {
    session: {},
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should throw BadRequestException if email already registered', async () => {
      // Arrange
      const signupDto = {
        email: 'test@example.com',
        password: 'password',
        firstname: 'Test',
        lastname: 'User',
      };
      mockUserService.findByEmail.mockResolvedValue({ email: signupDto.email });

      // Act & Assert
      await expect(service.signup(signupDto, mockRequest as any)).rejects.toThrow(BadRequestException);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(signupDto.email);
    });

    it('should throw BadRequestException if password not provided for normal signup', async () => {
      // Arrange
      const signupDto = {
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
      };
      mockUserService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signup(signupDto as any, mockRequest as any)).rejects.toThrow(BadRequestException);
    });

    it('should create a new user with hashed password and set session', async () => {
      // Arrange
      const signupDto = {
        email: 'test@example.com',
        password: 'password',
        firstname: 'Test',
        lastname: 'User',
      };
      const hashedPassword = 'hashed_password';
      const createdUser = {
        _id: 'user_id',
        email: signupDto.email,
        firstname: signupDto.firstname,
        lastname: signupDto.lastname,
      };
      const token = 'jwt_token';
      
      mockUserService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserService.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue(token);

      // Act
      const result = await service.signup(signupDto, mockRequest as any);

      // Assert
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(signupDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(mockUserService.create).toHaveBeenCalledWith({
        firstname: signupDto.firstname,
        lastname: signupDto.lastname,
        email: signupDto.email,
        password: hashedPassword,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ id: createdUser._id });
      expect(mockRequest.session).toEqual({ jwt: token });
      expect(result).toEqual({
        status: 201,
        message: 'User created',
        data: { id: createdUser._id, token },
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      mockUserService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto, mockRequest as any)).rejects.toThrow(UnauthorizedException);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if password not provided', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
      };
      mockUserService.findByEmail.mockResolvedValue({
        email: loginDto.email,
        password: 'hashed_password',
      });

      // Act & Assert
      await expect(service.login(loginDto as any, mockRequest as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      mockUserService.findByEmail.mockResolvedValue({
        email: loginDto.email,
        password: 'hashed_password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto, mockRequest as any)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, 'hashed_password');
    });

    it('should login user and set session if credentials valid', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = {
        _id: 'user_id',
        email: loginDto.email,
        password: 'hashed_password',
      };
      const token = 'jwt_token';
      
      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(token);

      // Act
      const result = await service.login(loginDto, mockRequest as any);

      // Assert
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ id: user._id });
      expect(mockRequest.session).toEqual({ jwt: token });
      expect(result).toEqual({
        status: 200,
        message: 'Login successful',
        data: { id: user._id, token },
      });
    });
  });

  describe('logout', () => {
    it('should clear session', async () => {
      // Arrange
      mockRequest.session = { jwt: 'token' };

      // Act
      const result = await service.logout(mockRequest as any);

      // Assert
      expect(mockRequest.session).toBeNull();
      expect(result).toEqual({
        status: 200,
        message: 'Logged out successfully',
      });
    });
  });

  describe('googleAuth', () => {
    it('should throw UnauthorizedException if no user in request', async () => {
      // Arrange
      const req = { user: null };

      // Act & Assert
      await expect(service.googleAuth(req as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should create new user if not exists and set session', async () => {
      // Arrange
      const googleUser = {
        googleId: 'google_id',
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
      };
      const req = { user: googleUser, session: {} };
      const createdUser = { _id: 'user_id', ...googleUser };
      const token = 'jwt_token';
      
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue(token);

      // Act
      const result = await service.googleAuth(req as any);

      // Assert
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(googleUser.email);
      expect(mockUserService.create).toHaveBeenCalledWith(googleUser);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ id: createdUser._id });
      expect(req.session).toEqual({ jwt: token });
      expect(result).toEqual({
        status: 200,
        message: 'Google authentication successful',
        data: { id: createdUser._id }
      });
    });

    it('should update existing user with googleId if needed', async () => {
      // Arrange
      const googleUser = {
        googleId: 'google_id',
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
      };
      const existingUser = {
        _id: 'user_id',
        email: googleUser.email,
        firstname: 'Existing',
        lastname: 'User',
        googleId: null,
        save: jest.fn().mockResolvedValue({ _id: 'user_id', ...googleUser }),
      };
      const req = { user: googleUser, session: {} };
      const token = 'jwt_token';
      
      mockUserService.findByEmail.mockResolvedValue(existingUser);
      mockJwtService.sign.mockReturnValue(token);

      // Act
      const result = await service.googleAuth(req as any);

      // Assert
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(googleUser.email);
      expect(existingUser.googleId).toBe(googleUser.googleId);
      expect(existingUser.save).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalledWith({ id: existingUser._id });
      expect(req.session).toEqual({ jwt: token });
      expect(result).toEqual({
        status: 200,
        message: 'Google authentication successful',
        data: { id: existingUser._id }
      });
    });
  });
});
