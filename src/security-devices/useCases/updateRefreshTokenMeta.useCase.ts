import { IRefreshTokenMeta } from '../interface'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SecurityDevicesService } from '../security-devices.service'
import { SecurityDevicesSqlRepository } from '../repositories'

class UpdateRefreshTokenMetaCommand {
  constructor(
    public readonly payload: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'> & {
      issuedAt: number
      expirationAt: number
    },
  ) {}
}

@CommandHandler(UpdateRefreshTokenMetaCommand)
class UpdateRefreshTokenMetaUseCase
  implements ICommandHandler<UpdateRefreshTokenMetaCommand>
{
  constructor(
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: UpdateRefreshTokenMetaCommand) {
    const { userId, deviceId, issuedAt, expirationAt } = command.payload

    const timeSteps = this.securityDevicesService.mapTimeStampsToDB({
      issuedAt,
      expirationAt,
    })

    const { iat, exp } = timeSteps

    return await this.securityDevicesSqlRepository.updateRefreshTokenMeta({
      userId,
      deviceId,
      issuedAt: iat,
      expirationAt: exp,
    })
  }
}

export { UpdateRefreshTokenMetaUseCase, UpdateRefreshTokenMetaCommand }
