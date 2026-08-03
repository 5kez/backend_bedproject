import { Injectable, Logger } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = Number(
      this.configService.get<string>('BCRYPT_ROUNDS') ?? 12,
    );
    return bcrypt.hash(password, saltRounds);
  }

  // Method to migrate existing plain text passwords to hashed passwords
  async migrateExistingPasswords(): Promise<void> {
    const users = await this.usersRepository.find();

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2b$)
      if (user.user_password && !user.user_password.startsWith('$2b$')) {
        this.logger.debug(`Migrating password for user: ${user.user_name}`);
        const hashedPassword = await this.hashPassword(user.user_password);
        await this.usersRepository.update(user.id, {
          user_password: hashedPassword,
        });
      }
    }
    this.logger.log('Password migration completed');
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Hash the password before saving
    if (createUserDto.user_password) {
      createUserDto.user_password = await this.hashPassword(
        createUserDto.user_password,
      );
    }
    return this.usersRepository.save(createUserDto);
  }

  getAllUsers(): Promise<User[]> {
    return this.usersRepository.find({
      select: {
        id: true,
        profile_id: true,
        site_id: true,
        user_name: true,
        name: true,
        last_name: true,
        build_id: true,
        status: true,
        role_id: true,
        roles_code: true,
        // 🔒 ไม่ส่งรหัสผ่านกลับไป frontend
        user_password: false,
        department_id: true,
      },
    });
  }
  async getUserById(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      select: {
        id: true,
        profile_id: true,
        site_id: true,
        user_name: true,
        name: true,
        last_name: true,
        build_id: true,
        status: true,
        role_id: true,
        roles_code: true,
        // 🔒 ไม่ส่งรหัสผ่านกลับไป frontend
        user_password: false,
        department_id: true,
      },
    });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async getUserByUsername(username: string) {
    const user = await this.usersRepository.findOneBy({ user_name: username });
    if (!user) {
      this.logger.debug(`User not found: ${username}`);
      return null; // Return null instead of throwing error
    }
    return user;
  }
  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    // Hash the password if it's being updated
    if (updateUserDto.user_password) {
      updateUserDto.user_password = await this.hashPassword(
        updateUserDto.user_password,
      );
    }
    return this.usersRepository.update(id, updateUserDto);
  }

  async deleteUser(id: number) {
    const user = await this.usersRepository.findOneBy({ id: id });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return this.usersRepository.remove(user);
  }

  async getUsersBySite(site_id: string) {
    this.logger.debug(`Looking for users from site: ${site_id}`);
    const users = await this.usersRepository.find({
      where: { site_id: Number(site_id), role_id: In([1, 4, 5]) },
    });
    if (users.length === 0) {
      this.logger.debug(`No users found for site: ${site_id}`);
      return null; // Return null instead of throwing error
    }
    this.logger.debug(`Found ${users.length} user(s) for site: ${site_id}`);
    return users;
  }

  async getNurseBySite(site_id: string) {
    this.logger.debug(`Looking for nurses from site: ${site_id}`);
    const users = await this.usersRepository.find({
      where: { site_id: Number(site_id), role_id: In([1, 4]) },
    });
    if (users.length === 0) {
      this.logger.debug(`No nurses found for site: ${site_id}`);
      return null; // Return null instead of throwing error
    }
    this.logger.debug(`Found ${users.length} nurse(s) for site: ${site_id}`);
    return users;
  }
}
