import { AuthGuard } from '@nestjs/passport'
import { CanActivate, ExecutionContext } from '@nestjs/common'
import { UsersController } from '../../users'

const PROTECTED_CONTROLLERS = [UsersController]

export class BasicAuthGuard extends AuthGuard('basic') implements CanActivate {
  canActivate(context: ExecutionContext) {
    const controllerCls = context.getClass()

    if (!PROTECTED_CONTROLLERS.includes(controllerCls)) {
      return true
    }

    return super.canActivate(context)
  }
}
