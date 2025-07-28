import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './tasks.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksStatus } from './tasks-status.enum';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) {}

    async getTasks(filterDto:GetTaskFilterDto):Promise<Task[]>{
        
        const { status, search } = filterDto;
        const query =  this.tasksRepository.createQueryBuilder('task');

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

    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        const { title, description } = createTaskDto;
        const task = this.tasksRepository.create({
            title,
            description,
            status: TasksStatus.OPEN,
        });
        await this.tasksRepository.save(task);
        return task;
    }

    async getTaskById(id: string): Promise<Task> {
        const found = await this.tasksRepository.findOne({ where: { id } });

        if (!found) {
            throw new NotFoundException(`Task with id "${id}" not found`);
        }

        return found;
    }

    async deleteTask(id: string): Promise<void> {
        const result =  await this.tasksRepository.delete(id);

        if(result.affected === 0) {
            throw new NotFoundException(`Task with id "${id}" not found`);
        }
    }

    async updateTaskStatus(id: string, status: TasksStatus): Promise<Task> {

        const task =  await this.getTaskById(id);
        task.status = status;

        await this.tasksRepository.save(task);
        return task;
    }
}
