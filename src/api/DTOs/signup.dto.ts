import { IsEmail, IsNotEmpty } from "class-validator";

export class SignupDTO {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    name: string;
    
    @IsNotEmpty()
    password: string;
}