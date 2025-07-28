import { IsNotEmpty } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User{

    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({unique : true})
    username:string;

    @Column()
    password:string;
}