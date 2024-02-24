import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common'
import { SecurityDevicesService } from './security-devices.service'
import { JwtRefreshGuard } from '../libs/guards'
import { User } from '../libs/decorators'
import { IJwtUser } from '../libs/interfaces'

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesService: SecurityDevicesService,
  ) {}

  @UseGuards(JwtRefreshGuard)
  @Get()
  private async getAllDevices(@User() user: IJwtUser) {
    const { userId } = user

    return await this.securityDevicesService.getAllDevices(userId)
  }

  @UseGuards(JwtRefreshGuard)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteAllDevices(@User() user: IJwtUser) {
    const { userId, deviceId } = user

    return await this.securityDevicesService.deleteAllDevices({
      userId,
      deviceId,
    })
  }

  @UseGuards(JwtRefreshGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteDeviceByDeviceId(
    @Param('id') id: string,
    @User() user: IJwtUser,
  ) {
    const device = await this.securityDevicesService.getDeviceByDeviceId(id)

    if (!device) {
      throw new NotFoundException({ message: 'device is not exists' })
    }

    if (user.userId !== device?.userId) {
      throw new ForbiddenException()
    }

    return await this.securityDevicesService.deleteDeviceByDeviceId(id)
  }
}
