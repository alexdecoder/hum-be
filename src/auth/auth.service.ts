import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/services/users.service";
import { Admin } from "@prisma/client";

@Injectable()
export class AuthService {
    constructor(private readonly user: UserService, private jwtService: JwtService) {}

    async verifyUser(email: string, password: string): Promise<Admin | null> {
        const user = await this.user.getUser(email);
        if(user && await bcrypt.compare(password, user.password)) {
            return user;
        }

        return null;
    }

    async login(password: string, email: string) {
        const payload = { email: email };

        let user = await this.verifyUser(email, password);
        if(user != null) {
            return {
                access_token: this.jwtService.sign(payload),
                isViewOnly: user.isViewOnly,
            };
        }

        throw new UnauthorizedException();
    }
}