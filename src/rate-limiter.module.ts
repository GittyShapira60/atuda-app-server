import { ThrottlerModule } from '@nestjs/throttler';

export const RateLimiterModule = ThrottlerModule.forRoot([
  {
    ttl: 60 * 1000,
    limit: 50,
  },
]);
