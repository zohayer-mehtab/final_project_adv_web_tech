import { Injectable,BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserProfile(id: number) {
    return await this.usersService.findOne(id);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const resetToken = crypto.randomInt(100000, 999999).toString();

    const resetTokenExpires = new Date();
    resetTokenExpires.setMinutes(resetTokenExpires.getMinutes() + 15);
  

    await this.usersService.update(user.id, {
      resetToken,
      resetTokenExpires,
    });
    
    try{
      await this.mailService.sendPasswordResetEmail(email, resetToken);
    }
    catch(error){
      console.error('Error sending password reset email:', error);
      
    }

    return { message: 'Password reset code sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
      const user = await this.usersService.findByResetToken(token);
      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      if (new Date() > user.resetTokenExpires) {
        throw new BadRequestException('Reset token has expired');
      }


      //I hashed the password and it is being hashed again in the users service update method, so the password is being hashed twice, creating a mess.
      //const hashedPassword = await bcrypt.hash(newPassword, 10); //bad code, kept for reference.


      //user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpires = null;

      await this.usersService.update(user.id,{
        password: newPassword,
        resetToken: null,
        resetTokenExpires: null,
      });

      return { message: 'Password has been reset successfully' };
    }
  }
  
  
  




