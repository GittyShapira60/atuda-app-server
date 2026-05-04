import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as passport from 'passport';
import * as session from 'express-session';
import { SESSION_SECRET } from './config';
import { LoginGuard } from './authentication/login.guard';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ENV } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('bakashot-api/');
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('atuda requests API')
    .setDescription('API for atuda requests')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('bakashot-api', app, document);
  app.set('trust proxy', 1);
  app.use(json({ limit: '50mb' }));
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: ENV === 'PROD' || ENV === 'PREPROD',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      },
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'"],
          fontSrc: ["'self'"],
          mediaSrc: ["'self'"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          frameSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 2 * 365 * 24 * 60 * 60,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      referrerPolicy: { policy: 'no-referrer' },
      xPermittedCrossDomainPolicies: {
        permittedPolicies: 'none',
      },
      xXssProtection: true,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new LoginGuard(reflector));

  await app.listen(3000);
}
bootstrap();
