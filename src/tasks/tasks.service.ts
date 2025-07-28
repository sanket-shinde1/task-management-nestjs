import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './tasks.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksStatus } from './tasks-status.enum';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) {}

    async getTasks(filterDto:GetTaskFilterDto, user:User):Promise<Task[]>{
        
        const { status, search } = filterDto;
        const query =  this.tasksRepository.createQueryBuilder('task');
        query.where({ user });

        if(status){
            query.andWhere('task.status = :status', { status });
        }

        if(search){
            query.andWhere(
                '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
                { search: `%${search}%` },
            );
        }

        const tasks = await query.getMany();
        return tasks;

    }

    async createTask(createTaskDto: CreateTaskDto, user:User): Promise<Task> {
        const { title, description } = createTaskDto;
        const task = this.tasksRepository.create({
            title,
            description,
            status: TasksStatus.OPEN,
            user,
        });
        await this.tasksRepository.save(task);
        return task;
    }

    async getTaskById(id: string, user:User ): Promise<Task> {
        const found = await this.tasksRepository.findOne({ where: { id , user} });

        if (!found) {
            throw new NotFoundException(`Task with id "${id}" not found`);
        }

        return found;
    }

    async deleteTask(id: string, user:User): Promise<void> {
        const result =  await this.tasksRepository.delete({id, user});

        if(result.affected === 0) {
            throw new NotFoundException(`Task with id "${id}" not found`);
        }
    }

    async updateTaskStatus(id: string, status: TasksStatus, user:User): Promise<Task> {

        const task =  await this.getTaskById(id,user);
        task.status = status;

        await this.tasksRepository.save(task);
        return task;
    }
}
