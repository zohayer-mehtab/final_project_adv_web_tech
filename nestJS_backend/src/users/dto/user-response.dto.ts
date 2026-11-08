import { Role } from '../../role.enum';
import { User } from '../entities/user.entity';

export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  role: Role;
  isApproved: boolean;
  companyName?: string;
}

export function toUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isApproved: user.isApproved,
    companyName: user.companyName,
  };
}
