import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Check for session
    if (!request.session?.jwt) {
      throw new UnauthorizedException('No session found');
    }

    try {
      const payload = this.jwtService.verify(request.session.jwt);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid session');
    }
  }
} 