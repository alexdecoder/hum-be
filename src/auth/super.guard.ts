import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from 'src/services/users.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
    constructor(private readonly user: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        return !(await this.user.getUser(request.user.email)).isViewOnly;
    }
}