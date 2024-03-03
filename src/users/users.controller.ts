import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { GetUsersRequestQuery } from './interfaces'
import { CreateUserDto } from './dto'
import { BasicAuthGuard } from '../libs/guards'
import { UUIDParam } from '../libs/decorators'
import {
  CreateUserCommand,
  DeleteUserByIdCommand,
  GetAllUsersCommand,
} from './useCases'

@Controller('users')
export class UsersController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  private async getAll(@Query() query: GetUsersRequestQuery<string>) {
    return await this.commandBus.execute(new GetAllUsersCommand(query))
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  private async create(@Body() body: CreateUserDto) {
    return await this.commandBus.execute(new CreateUserCommand(body))
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteById(
    @UUIDParam('id')
    id: string,
  ) {
    const result = await this.commandBus.execute(new DeleteUserByIdCommand(id))

    if (!result) {
      throw new NotFoundException({ message: 'users is not exists' })
    }

    return result
  }
}
