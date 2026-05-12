import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TelegramGuard } from '../auth/telegram.guard';

@Controller('admin')
// @UseGuards(TelegramGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  private getUserId(req: any): number {
    return req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : 1;
  }

  @Get('stats')
  async getStats(@Req() req) {
    await this.adminService.checkAdmin(this.getUserId(req));
    return this.adminService.getStats();
  }

  @Get('users')
  async getUsers(@Req() req) {
    await this.adminService.checkAdmin(this.getUserId(req));
    return this.adminService.getAllUsers();
  }

  @Post('users/update')
  async updateUser(@Req() req, @Body() body: { userId: number; vts?: number; nts?: number; stars?: number; role?: string }) {
    await this.adminService.checkAdmin(this.getUserId(req));
    return this.adminService.updateUserBalance(body.userId, body.vts, body.nts, body.stars, body.role);
  }

  @Get('wallets')
  async getWallets(@Req() req) {
    await this.adminService.checkAdmin(this.getUserId(req));
    return this.adminService.getWallets();
  }

  @Post('wallets/update')
  async updateWallet(@Req() req, @Body() body: { currency: string; address: string }) {
    await this.adminService.checkAdmin(this.getUserId(req));
    return this.adminService.updateWallet(body.currency, body.address);
  }

  @Post('wallets/add')
  async addWallet(@Req() req, @Body() body: { currency: string; address: string; minAmount: number }) {
    await this.adminService.checkAdmin(this.getUserId(req));
    return this.adminService.addWallet(body.currency, body.address, body.minAmount);
  }

  @Post('wallets/toggle')
  async toggleWallet(@Req() req, @Body() body: { currency: string; isActive: boolean }) {
    await this.adminService.checkAdmin(this.getUserId(req));
    return this.adminService.toggleWallet(body.currency, body.isActive);
  }

  @Get('payments')
  async getPayments(@Req() req) {
    await this.adminService.checkAdmin(this.getUserId(req));
    return this.adminService.getPayments();
  }

  @Get('rates')
  async getExchangeRates(@Req() req) {
    await this.adminService.checkAdmin(this.getUserId(req));
    return this.adminService.getExchangeRates();
  }

  @Post('rates/update')
  async updateExchangeRate(@Req() req, @Body() body: { currency: string; rate: number }) {
    await this.adminService.checkAdmin(this.getUserId(req));
    return this.adminService.updateExchangeRate(body.currency, body.rate);
  }

  @Post('bonus/global')
  async sendGlobalBonus(@Req() req, @Body() body: { amount: number; type: 'vts' | 'nts' | 'stars' }) {
    await this.adminService.checkAdmin(this.getUserId(req));
    return this.adminService.sendGlobalBonus(body.amount, body.type);
  }

  @Post('notify')
  async sendNotification(@Req() req, @Body() body: { title: string; content: string }) {
    await this.adminService.checkAdmin(this.getUserId(req));
    return this.adminService.sendNotificationToAll(body.title, body.content);
  }
}