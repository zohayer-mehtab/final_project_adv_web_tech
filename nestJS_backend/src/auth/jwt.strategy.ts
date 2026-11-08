import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Role } from '../role.enum';

export type JwtPayload = {
  //Written for type safety, to ensure that the payload contains the expected properties when validating the JWT token.
  sub: number; // user ID
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'), // used because we are sure that JWT_SECRET is defined in our .env file, and it will throw an error if it's not defined, preventing the application from starting without a valid secret key.
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findAuthUserById(payload.sub);
    if (!user || (user.role === Role.VENDOR && !user.isApproved)) {
      throw new UnauthorizedException();
    }
    return { userId: user.id, email: user.email, role: user.role };
  }
}
