import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksDto } from './dto/get-tasks.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateTaskDto) {
    return await this.tasksService.create(req.user.sub, dto);
  }

  @Get()
  async findAll(@Request() req, @Query() query: GetTasksDto) {
    return await this.tasksService.findAll(req.user.sub, query);
  }

  @Get(':id')
  async findOne(@Param() id: number, @Request() req) {
    return await this.tasksService.findOne(req.user.sub, +id);
  }

  @Get(':id')
  async delete(@Param() id: number, @Request() req) {
    return await this.tasksService.remove(req.user.sub, +id);
  }

  // ... other methods remain the same
}
