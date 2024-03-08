import { IRefreshTokenMeta } from '../interface'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SecurityDevicesService } from '../security-devices.service'
import { SecurityDevicesSqlRepository } from '../repositories'

class GetRefreshTokenMetaCommand {
  constructor(
    public readonly payload: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'> & {
      issuedAt: number
      expirationAt: number
    },
  ) {}
}

@CommandHandler(GetRefreshTokenMetaCommand)
class GetRefreshTokenMetaUseCase
  implements ICommandHandler<GetRefreshTokenMetaCommand>
{
  constructor(
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: GetRefreshTokenMetaCommand) {
    const { userId, deviceId, issuedAt, expirationAt } = command.payload

    const timeSteps = this.securityDevicesService.mapTimeStampsToDB({
      issuedAt,
      expirationAt,
    })

    const { iat, exp } = timeSteps

    return await this.securityDevicesSqlRepository.getRefreshTokenMeta({
      userId,
      deviceId,
      issuedAt: iat,
      expirationAt: exp,
    })
  }
}

export { GetRefreshTokenMetaUseCase, GetRefreshTokenMetaCommand }
