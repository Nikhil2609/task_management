import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() body: any) {
    // Logic will be implemented in AuthController for unified signup/login
    return { message: 'Stub for signup', body };
  }
}
