import { CanActivate, ExecutionContext, HttpException, Injectable, HttpStatus } from '@nestjs/common';

type Window = { count: number; expiresAt: number };

@Injectable()
export class EndpointRateLimitGuard implements CanActivate {
  private readonly windows = new Map<string, Window>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const route = context.getHandler().name;
    const limits: Record<string, [number, number]> = {
      login: [5, 60_000],
      forgotPassword: [3, 15 * 60_000],
      resetPassword: [5, 15 * 60_000],
    };
    const [limit, duration] = limits[route] ?? [5, 60_000];
    const now = Date.now();
    const key = `${route}:${request.ip}`;
    let window = this.windows.get(key);
    if (!window || window.expiresAt <= now) {
      window = { count: 0, expiresAt: now + duration };
      this.windows.set(key, window);
    }
    window.count += 1;
    if (this.windows.size > 10_000) {
      for (const [windowKey, value] of this.windows) {
        if (value.expiresAt <= now) this.windows.delete(windowKey);
      }
      if (this.windows.size > 10_000) {
        const oldestKey = this.windows.keys().next().value;
        if (oldestKey) this.windows.delete(oldestKey);
      }
    }
    if (window.count > limit) {
      throw new HttpException('Too many requests. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
