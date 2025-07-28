import { EntityRepository, Repository } from "typeorm";
import { Task } from "./tasks.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TasksStatus } from "./tasks-status.enum";
import { GetTaskFilterDto } from "./dto/get-task-filter.dto";

@EntityRepository(Task)
export class TasksRepository extends Repository<Task>{
 
    async getTasks(filterDto:GetTaskFilterDto): Promise<Task[]> {
        const Query =  this.createQueryBuilder('task');
        const tasks = await Query.getMany();
        return tasks;
    }
}