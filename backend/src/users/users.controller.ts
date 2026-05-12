import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  
  @Get('balance')
  async getBalance(@Req() req) {
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : 1;
    return this.usersService.getBalance(userId);
  }
}