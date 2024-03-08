import { IRefreshTokenMeta } from '../interface'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SecurityDevicesSqlRepository } from '../repositories'

class DeleteRefreshTokenMetaCommand {
  constructor(
    public readonly payload: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'>,
  ) {}
}

@CommandHandler(DeleteRefreshTokenMetaCommand)
class DeleteRefreshTokenMetaUseCase
  implements ICommandHandler<DeleteRefreshTokenMetaCommand>
{
  constructor(
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: DeleteRefreshTokenMetaCommand) {
    return await this.securityDevicesSqlRepository.deleteRefreshTokenMeta(
      command.payload,
    )
  }
}

export { DeleteRefreshTokenMetaUseCase, DeleteRefreshTokenMetaCommand }
