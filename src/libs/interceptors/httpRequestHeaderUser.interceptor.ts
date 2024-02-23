import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { JwtService } from '../../configs'

@Injectable()
class HttpRequestHeaderUserInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest()

    const { authorization } = request.headers

    if (!authorization) {
      return next.handle()
    }

    const [__, token] = authorization.split(' ')

    const payload = this.jwtService.getJwtDataByToken(token)

    if (!payload) {
      return next.handle()
    }

    request.user = {
      userId: payload.userId,
    }

    return next.handle()
  }
}

export { HttpRequestHeaderUserInterceptor }
