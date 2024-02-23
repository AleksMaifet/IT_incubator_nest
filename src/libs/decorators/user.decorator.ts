import { createParamDecorator, ExecutionContext } from '@nestjs/common'

const User = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()

  return request.user
})

export { User }
