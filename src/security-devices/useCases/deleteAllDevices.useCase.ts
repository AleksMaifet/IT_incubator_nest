import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SecurityDevicesSqlRepository } from '../repositories'
import { IRefreshTokenMeta } from '../interface'

class DeleteAllDevicesCommand {
  constructor(
    public readonly payload: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'>,
  ) {}
}

@CommandHandler(DeleteAllDevicesCommand)
class DeleteAllDevicesUseCase
  implements ICommandHandler<DeleteAllDevicesCommand>
{
  constructor(
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: DeleteAllDevicesCommand) {
    return await this.securityDevicesSqlRepository.deleteAllDevices(
      command.payload,
    )
  }
}

export { DeleteAllDevicesUseCase, DeleteAllDevicesCommand }
