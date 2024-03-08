import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SecurityDevicesSqlRepository } from '../repositories'

class GetDeviceByDeviceIdCommand {
  constructor(public readonly payload: string) {}
}

@CommandHandler(GetDeviceByDeviceIdCommand)
class GetDeviceByDeviceIdUseCase
  implements ICommandHandler<GetDeviceByDeviceIdCommand>
{
  constructor(
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: GetDeviceByDeviceIdCommand) {
    return await this.securityDevicesSqlRepository.getDeviceByDeviceId(
      command.payload,
    )
  }
}

export { GetDeviceByDeviceIdUseCase, GetDeviceByDeviceIdCommand }
