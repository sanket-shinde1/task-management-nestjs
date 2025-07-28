import { IsEnum } from "class-validator";
import { TasksStatus } from "../tasks-status.enum";

export class UpdateTaskStatusDto{
    @IsEnum(TasksStatus)
    status:TasksStatus;
}