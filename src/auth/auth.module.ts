import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      global: false,
      secret: process.env.JWT_SECRET ?? 'dev-secret-cambiar-en-produccion',
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRES_SECONDS ?? 60 * 60 * 24 * 7),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
