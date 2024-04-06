import { IUserPostLike } from '../interfaces'

class UserLikeInfoEntity implements IUserPostLike {
  constructor(
    public readonly userId: string,
    public readonly login: string,
  ) {}
}

export { UserLikeInfoEntity }
