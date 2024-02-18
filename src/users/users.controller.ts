import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { GetUsersRequestQuery } from './interfaces'
import { CreateUserDto } from './dto'
import { BasicAuthGuard } from '../libs/guards'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  private async getAll(@Query() query: GetUsersRequestQuery<string>) {
    return await this.usersService.getAll(query)
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  private async create(@Body() body: CreateUserDto) {
    return await this.usersService.create(body)
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteById(@Param('id') id: string) {
    const result = await this.usersService.deleteById(id)

    if (!result) {
      throw new NotFoundException({ message: 'users is not exists' })
    }

    return result
  }
}
