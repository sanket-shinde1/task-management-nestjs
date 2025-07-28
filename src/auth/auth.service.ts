import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService : JwtService,
    ){}

   async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialsDto;
        
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = this.userRepository.create({ username, password:hashedPassword });
        try{
            await this.userRepository.save(user);
        }catch(error){
            if (error.code === '23505') { // Unique constraint violation    
            throw new ConflictException('Username already exists');
            }else{
                throw new InternalServerErrorException();
            }
        }
    }

    async signIn(authCredentialsDto:AuthCredentialsDto):Promise<{accessToken:string}> {
        const {username, password} = authCredentialsDto;
        const user = await this.userRepository.findOne({ where: { username } });

        if(user && await bcrypt.compare(password, user.password)){
            // User authenticated successfully
            const payload : JwtPayload = {username};
            const accessToken = await this.jwtService.sign(payload);
            return { accessToken };
        }else{
            throw new UnauthorizedException('Invalid credentials');
        }
    }
}