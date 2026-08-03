import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/user/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    user_name: string,
    user_password: string,
  ): Promise<{ access_token: string; data: any }> {
    const user = await this.usersService.getUserByUsername(user_name);
    if (!user || !user.user_password) {
      this.logger.warn(`Login failed: unknown user "${user_name}"`);
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          errorType: 'invalid_credentials',
          message: 'Invalid credentials',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!user.status) {
      this.logger.warn(`Login rejected: inactive user "${user_name}"`);
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          errorType: 403,
          message: 'User is inactive',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      user_password,
      user.user_password,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: invalid password for "${user_name}"`);
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          errorType: 401,
          message: 'Invalid password',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    this.logger.log(`Login successful for "${user_name}"`);
    const payload = { sub: user.id, user_name: user.user_name };

    const userResponse = {
      id: user.id,
      profile_id: user.profile_id,
      site_id: user.site_id,
      user_name: user.user_name,
      name: user.name,
      last_name: user.last_name,
      build_id: user.build_id,
      status: user.status,
      role_id: user.role_id,
      roles_code: user.roles_code,
      department_id: user.department_id,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      data: userResponse,
    };
  }
}
