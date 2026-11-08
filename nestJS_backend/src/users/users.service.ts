import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { Role } from '../role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { toUserResponse, UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user ? toUserResponse(user) : null;
  }

  async findAuthUserById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto | null> {
    const { username, email, companyName, password } = updateUserDto;
    const changes: Partial<User> = {};
    if (username !== undefined) changes.username = username;
    if (email !== undefined) changes.email = email;
    if (companyName !== undefined) changes.companyName = companyName;
    if (password !== undefined) changes.password = await bcrypt.hash(password, 10);
    await this.usersRepository.update(id, changes);

    return this.findOne(id);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const isApproved = createUserDto.role === Role.VENDOR ? false : true;

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      isApproved,
    });
    return toUserResponse(await this.usersRepository.save(newUser));
  }
  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
    if (registerDto.role !== Role.BUYER && registerDto.role !== Role.VENDOR) {
      throw new ConflictException('Invalid registration role');
    }
    return this.create({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      role: registerDto.role,
      companyName: registerDto.companyName,
    });
  }
  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async approveUser(id: number) {
    await this.usersRepository.update(id, { isApproved: true });

    return this.findOne(id);
  }

  // This was not in the proposal, I added it for completeness.
  async rejectUser(id: number) {
    await this.usersRepository.update(id, { isApproved: false });

    return this.findOne(id);
  }

  async findAllVendors(): Promise<UserResponseDto[]> {
    return (await this.usersRepository.find({ where: { role: Role.VENDOR } })).map(toUserResponse);
  }

  async setResetToken(id: number, hash: string, expires: Date): Promise<void> {
    await this.usersRepository.update(id, { resetToken: hash, resetTokenExpires: expires });
  }

  async clearResetToken(id: number, hash: string): Promise<void> {
    await this.usersRepository.update({ id, resetToken: hash }, { resetToken: null, resetTokenExpires: null });
  }

  async consumeResetToken(hash: string, newPassword: string): Promise<boolean> {
    const password = await bcrypt.hash(newPassword, 10);
    const result = await this.usersRepository.update(
      { resetToken: hash, resetTokenExpires: MoreThan(new Date()) },
      { password, resetToken: null, resetTokenExpires: null },
    );
    return result.affected === 1;
  }
  
  async findAll(): Promise<UserResponseDto[]> {
    return (await this.usersRepository.find()).map(toUserResponse);
  } 


}
