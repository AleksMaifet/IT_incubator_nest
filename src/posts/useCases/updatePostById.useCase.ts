import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import { PostsSqlRepository, UpdatePostDto } from '../../posts'

class UpdatePostByIdCommand {
  constructor(public readonly payload: { id: string; dto: UpdatePostDto }) {}
}

@CommandHandler(UpdatePostByIdCommand)
class UpdatePostByIdUseCase implements ICommandHandler<UpdatePostByIdCommand> {
  constructor(
    @Inject(forwardRef(() => PostsSqlRepository))
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: UpdatePostByIdCommand) {
    const { id, dto } = command.payload

    return await this.postsSqlRepository.updateById(id, dto)
  }
}

export { UpdatePostByIdUseCase, UpdatePostByIdCommand }
