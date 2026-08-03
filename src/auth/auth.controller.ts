import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AuthUser } from './AuthUser';
import { SignInDto } from './dto/sign-in.dto';

interface JwtPayload {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() body: SignInDto) {
    try {
      return await this.authService.signIn(body.username, body.password);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new HttpException(
          { errorType: 'invalid_password', message: error.message },
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (error instanceof ForbiddenException) {
        throw new HttpException(
          { errorType: 'inactive_user', message: error.message },
          HttpStatus.FORBIDDEN,
        );
      }
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@AuthUser() user: JwtPayload) {
    return user;
  }
}
