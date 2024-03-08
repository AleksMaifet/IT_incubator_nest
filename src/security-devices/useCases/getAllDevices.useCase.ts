import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SecurityDevicesSqlRepository } from '../repositories'

class GetAllDevicesCommand {
  constructor(public readonly payload: string) {}
}

@CommandHandler(GetAllDevicesCommand)
class GetAllDevicesUseCase implements ICommandHandler<GetAllDevicesCommand> {
  constructor(
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: GetAllDevicesCommand) {
    return await this.securityDevicesSqlRepository.getAllDevices(
      command.payload,
    )
  }
}

export { GetAllDevicesUseCase, GetAllDevicesCommand }
