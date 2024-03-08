import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { IRefreshTokenMeta } from '../interface'
import { SecurityDevicesService } from '../security-devices.service'
import { SecurityDevicesSqlRepository } from '../repositories'

class CreateRefreshTokenMetaCommand {
  constructor(
    public readonly payload: Pick<
      IRefreshTokenMeta,
      'userId' | 'deviceId' | 'deviceName' | 'clientIp'
    > & {
      issuedAt: number
      expirationAt: number
    },
  ) {}
}

@CommandHandler(CreateRefreshTokenMetaCommand)
class CreateRefreshTokenMetaUseCase
  implements ICommandHandler<CreateRefreshTokenMetaCommand>
{
  constructor(
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: CreateRefreshTokenMetaCommand) {
    const { userId, deviceId, issuedAt, expirationAt, deviceName, clientIp } =
      command.payload

    const timeSteps = this.securityDevicesService.mapTimeStampsToDB({
      issuedAt,
      expirationAt,
    })

    const { iat, exp } = timeSteps

    return await this.securityDevicesSqlRepository.createRefreshTokenMeta({
      userId,
      deviceId,
      issuedAt: iat,
      expirationAt: exp,
      deviceName,
      clientIp,
    })
  }
}

export { CreateRefreshTokenMetaUseCase, CreateRefreshTokenMetaCommand }
