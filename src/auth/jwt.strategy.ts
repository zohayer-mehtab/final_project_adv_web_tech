import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';


export type JwtPayload = { //Written for type safety, to ensure that the payload contains the expected properties when validating the JWT token.
    sub: number; // user ID
    email: string;
    role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'), // used because we are sure that JWT_SECRET is defined in our .env file, and it will throw an error if it's not defined, preventing the application from starting without a valid secret key.
        });
    }

    async validate(payload: JwtPayload) {
        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}