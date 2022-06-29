import { BadRequestException, Body, ConflictException, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Req, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from 'src/auth/auth.service';
import { parse } from 'csv-parse';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminAuthGuard } from 'src/auth/super.guard';
import { PrismaService } from 'src/services/prisma.service';
import { UserService } from 'src/services/users.service';
import { StudentDTO } from './DTOs/base-data.dto';
import { LoginDTO } from './DTOs/login.dto';
import { SignupDTO } from './DTOs/signup.dto';
import { SortService } from 'src/services/sort.service';

@Controller('api')
export class ApiController {
    constructor(private readonly auth: AuthService, private readonly user: UserService, private readonly prisma: PrismaService, private readonly sortService: SortService) {}

    @Post('auth/login')
    @HttpCode(200)
    async loginView(@Body() loginDTO: LoginDTO) {
        return this.auth.login(loginDTO.password, loginDTO.email.toLowerCase().trim());
    }

    @Get('signup/generate')
    @UseGuards(JwtAuthGuard, AdminAuthGuard)
    async generateSignupCode() {
        const signupObject = await this.prisma.signup.create({data: {}});

        return {
            'code': signupObject.uuid,
        };
    }

    @Get('signup/confirm/:id')
    async confirmSignupCode(@Param('id') id: string) {
        const target = await this.prisma.signup.findUnique({
            where: {
                uuid: id,
            }
        });

        if(target === null) {
            throw new NotFoundException;
        }
    }

    @Post('signup/:id')
    async signupFromAuthCode(@Body() signupDTO: SignupDTO, @Param('id') id: string) {
        const target = await this.prisma.signup.findUnique({
            where: {
                uuid: id,
            }
        });

        if(target === null) {
            throw new NotFoundException;
        }

        let userObject;
        try {
            userObject = await this.user.createUser(signupDTO.name, signupDTO.email, signupDTO.password, true);
        } catch (error) {
            if(error.code == 'P2002') {
                throw new ConflictException;
            }
        }

        await this.prisma.signup.delete({
            where: {
                id: target.id,
            }
        });

        return {
            jwt: await this.user.authorizeWithoutPassword(userObject),
        };
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async baseData(@Req() req) {
        const user = await this.user.getUser(req.user.email);

        if(user == null) {
            throw new UnauthorizedException;
        }

        let filteredAdmins;
        if(!user.isViewOnly) {
            const admins = (await this.prisma.admin.findMany()).filter((admin) => admin.email != user.email);
            filteredAdmins = admins.map((admin) => ({
                name: admin.name,
                email: admin.email,
                isViewOnly: admin.isViewOnly,
                uuid: admin.uuid,
            }));
        }

        let rawStudents = await this.prisma.student.findMany({
            orderBy: {
                name: 'asc',
            }
        });
        let students: StudentDTO[] = await Promise.all(
            rawStudents.map<StudentDTO>((student) => ({
                status: 'EXACT',
                name: student.name,
                email: student.email,
                monday: student.mon,
                tuesday: student.tues,
                wednesday: student.wed,
                thursday: student.thrs,
                friday: student.fri,
                subjects: student.subject,
                mentor: {
                    name: 'Jeff Williams',
                    monday: ['6:30-7:30'],
                    tuesday: ['6:30-7:30'],
                    wednesday: ['6:30-7:30'],
                    thursday: ['6:30-7:30', '7:30-8:30'],
                    friday: ['6:30-7:30'],
                    subjects: ['Math'],
                    students: [],
                },
            })),
        );

        let buffer = {
            user: {
                isViewOnly: user.isViewOnly,
            },
            students: students,
            mentors: [
                {
                    name: 'Jeff Williams',
                    email: 'jeff@ex.com',
                    monday: ['6:30-7:30'],
                    tuesday: ['6:30-7:30'],
                    wednesday: ['6:30-7:30'],
                    thursday: ['6:30-7:30'],
                    friday: ['6:30-7:30'],
                    subjects: ['Math', 'History'],
                }
            ],
            admins: filteredAdmins,
        };

        return buffer;
    }

    @Get('permissions/toggle/:id')
    @UseGuards(JwtAuthGuard, AdminAuthGuard)
    async toggleEditPermissions(@Param('id') id: string) {
        const target = await this.prisma.admin.findUnique({where: {uuid: id}});

        if(target === null) {
            throw new NotFoundException;
        }

        await this.prisma.admin.update({
            where: {
                id: target.id,
            },
            data: {
                isViewOnly: !target.isViewOnly,
            }
        });
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard, AdminAuthGuard)
    async deleteAdmin(@Param('id') id: string) {
        const target = await this.prisma.admin.findUnique({where: {uuid: id}});

        if(target === null) {
            throw new NotFoundException;
        }

        await this.prisma.admin.delete({
            where: {
                id: target.id,
            },
        });
    }

    @Post('upload/student')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(JwtAuthGuard, AdminAuthGuard)
    async uploadStudentFile(@UploadedFile() file: Express.Multer.File) {
        await this.sortService.importStudentsData(file.buffer.toString());
        // throw new BadRequestException({'message': 'This is a test message'});
    }

    @Post('upload/mentor')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(JwtAuthGuard, AdminAuthGuard)
    async uploadMentorFile(@UploadedFile() file: Express.Multer.File) {
        await this.sortService.importStudentsData(file.buffer.toString());
    }
}
