import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import * as bcrypt from 'bcrypt';
import { Admin } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UserService {
    constructor (private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

    async getUser(email: string): Promise<Admin> {
        return await this.prisma.admin.findUnique({
            where: {
                email: email,
            }
        });
    }

    async createUser(name: string, email: string, password: string, isViewOnly: boolean): Promise<Admin> {
        return await this.prisma.admin.create({
            data: {
                name: name,
                email: email,
                password: await bcrypt.hash(password, 12),
                isViewOnly: isViewOnly,
            }
        })
    }

    async authorizeWithoutPassword(admin: Admin): Promise<string> {
        return this.jwtService.sign({email: admin.email});
    }
}