import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SecurityDevicesSqlRepository } from '../repositories'

class DeleteDeviceByDeviceIdCommand {
  constructor(public readonly payload: string) {}
}

@CommandHandler(DeleteDeviceByDeviceIdCommand)
class DeleteDeviceByDeviceIdUseCase
  implements ICommandHandler<DeleteDeviceByDeviceIdCommand>
{
  constructor(
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: DeleteDeviceByDeviceIdCommand) {
    return await this.securityDevicesSqlRepository.deleteDeviceByDeviceId(
      command.payload,
    )
  }
}

export { DeleteDeviceByDeviceIdUseCase, DeleteDeviceByDeviceIdCommand }
