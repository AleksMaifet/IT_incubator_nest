import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UseGuards,
} from '@nestjs/common'
import { JwtRefreshGuard } from '../libs/guards'
import { User, UUIDParam } from '../libs/decorators'
import { IJwtUser } from '../libs/interfaces'
import { CommandBus } from '@nestjs/cqrs'
import {
  DeleteAllDevicesCommand,
  DeleteDeviceByDeviceIdCommand,
  GetAllDevicesCommand,
  GetDeviceByDeviceIdCommand,
} from './useCases'

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(JwtRefreshGuard)
  @Get()
  private async getAllDevices(@User() user: IJwtUser) {
    const { userId } = user

    return await this.commandBus.execute(new GetAllDevicesCommand(userId))
  }

  @UseGuards(JwtRefreshGuard)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteAllDevices(@User() user: IJwtUser) {
    const { userId, deviceId } = user

    return await this.commandBus.execute(
      new DeleteAllDevicesCommand({
        userId,
        deviceId,
      }),
    )
  }

  @UseGuards(JwtRefreshGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteDeviceByDeviceId(
    @UUIDParam('id') id: string,
    @User() user: IJwtUser,
  ) {
    const device = await this.commandBus.execute(
      new GetDeviceByDeviceIdCommand(id),
    )

    if (!device) {
      throw new NotFoundException({ message: 'device is not exists' })
    }

    if (user.userId !== device?.userId) {
      throw new ForbiddenException()
    }

    return await this.commandBus.execute(new DeleteDeviceByDeviceIdCommand(id))
  }
}
