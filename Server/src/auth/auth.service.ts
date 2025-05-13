import { Injectable, BadRequestException, UnauthorizedException, InternalServerErrorException, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/user.schema';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: 'http://localhost:5000/auth/google/callback',
    });
  }

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
  
  async handleGoogleAuth(body: any, req: Request) {
    try {
      const { accessToken } = body;
      console.log('Received access token:', accessToken);
  
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        const text = await response.text();
        console.error('Google API response error:', text);
        throw new UnauthorizedException('Invalid Google access token');
      }
  
      const profile = await response.json();
      console.log('Google profile:', profile);
  
      if (!profile.email_verified) {
        throw new UnauthorizedException('Google email not verified');
      }
  
      let user = await this.userService.findByEmail(profile.email);
      console.log('User from DB:', user);
  
      if (!user) {
        user = await this.userService.create({
          firstname: profile.given_name,
          lastname: profile.family_name,
          email: profile.email,
          googleId: profile.sub,
        });
        console.log('User created:', user);
      }
  
      const token = this.signJWT({ id: user._id });
      req.session = { jwt: token };
      console.log('JWT created and session set');
  
      return {
        status: 200,
        message: user ? 'Google login successful' : 'Google signup successful',
        data: { id: user._id, token },
      };
    } catch (error) {
      console.error('Error in handleGoogleAuth:', error);
      throw new InternalServerErrorException('Google login failed');
    }
  }

  async handleGoogleLogin(body: any, req: Request) {
    try {
      const { accessToken } = body;
      console.log('Received access token:', accessToken);
  
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        const text = await response.text();
        console.error('Google API response error:', text);
        throw new UnauthorizedException('Invalid Google access token');
      }
  
      const profile = await response.json();
      console.log('Google profile:', profile);
  
      if (!profile.email_verified) {
        throw new UnauthorizedException('Google email not verified');
      }
  
      let user = await this.userService.findByEmail(profile.email);
      console.log('User from DB:', user);
  
      if (!user) {
        user = await this.userService.create({
          firstname: profile.given_name,
          lastname: profile.family_name,
          email: profile.email,
          googleId: profile.sub,
        });
        console.log('User created:', user);
      }
  
      const token = this.signJWT({ id: user._id });
      req.session = { jwt: token };
      console.log('JWT created and session set');
  
      return {
        status: 200,
        message: user ? 'Google login successful' : 'Google signup successful',
        data: { id: user._id, token },
      };
    } catch (error) {
      console.error('Error in handleGoogleAuth:', error);
      throw new InternalServerErrorException('Google login failed');
    }
  }
  
  async logout(req: Request) {
    req.session = null;
    return { status: 200, message: 'Logged out successfully' };
  }
}
