import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/user.schema';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private signJWT(payload: any): string {
    return this.jwtService.sign(payload);
  }

  async signup(data: SignupDto, req: Request) {
    // Check if user exists by email
    const existing = await this.userService.findByEmail(data.email);
    if (existing) {
      throw new BadRequestException({ status: 409, message: 'Email already registered' });
    }

    // Normal signup
    if (!data.googleId) {
      if (!data.password) {
        throw new BadRequestException({ status: 400, message: 'Password is required for signup' });
      }
      const hashed = await bcrypt.hash(data.password, 10);
      const user = await this.userService.create({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: hashed,
      });
      const token = this.signJWT({ id: user._id });
      req.session = { jwt: token };
      return { status: 201, message: 'User created', data: { id: user._id, token: token } };
    }
  }

  async login(data: LoginDto, req: Request) {
    // Normal login
    if (!data.googleId) {
      const user = await this.userService.findByEmail(data.email);
      if (!user || !user.password) {
        throw new UnauthorizedException({ status: 401, message: 'Invalid credentials' });
      }
      if (!data.password) {
        throw new UnauthorizedException({ status: 401, message: 'Password is required' });
      }
      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) {
        throw new UnauthorizedException({ status: 401, message: 'Invalid credentials' });
      }
      const token = this.signJWT({ id: user._id });
      req.session = { jwt: token };
      return { status: 200, message: 'Login successful', data: { id: user._id, token: token } };
    }
  }

  async googleAuth(req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('No user from google');
    }

    const { googleId, email, firstname, lastname } = req.user as any;
    
    // Check if user exists by email
    let user = await this.userService.findByEmail(email);
    
    if (!user) {
      // Create new user
      user = await this.userService.create({
        firstname,
        lastname,
        email,
        googleId,
      });
    } else if (!user.googleId) {
      // Update existing user with Google ID
      user.googleId = googleId;
      await user.save();
    }

    // Generate JWT
    const token = this.jwtService.sign({ id: user._id });
    req.session = { jwt: token };

    return {
      status: 200,
      message: 'Google authentication successful',
      data: { id: user._id }
    };
  }

  async logout(req: Request) {
    req.session = null;
    return { status: 200, message: 'Logged out successfully' };
  }
}
