import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TelegramGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Пробуем получить токен из заголовка Authorization
    let token = request.headers.authorization?.replace('Bearer ', '');
    
    // Если нет токена, но есть x-user-id (для совместимости с моками)
    if (!token && request.headers['x-user-id']) {
      request.user = { id: parseInt(request.headers['x-user-id']), role: 'user' };
      return true;
    }
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super-secret-key-change-me',
      });
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}