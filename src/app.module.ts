import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ApiController } from './api/api.controller';
import { JwtConstants } from './auth/auth.constants';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { PrismaService } from './services/prisma.service';
import { UserService } from './services/users.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: JwtConstants.jwtSecret,
      signOptions: { expiresIn: '1 day' },
    }),
  ],
  controllers: [ApiController],
  providers: [PrismaService, JwtStrategy, AuthService, UserService],
})
export class AppModule {}
