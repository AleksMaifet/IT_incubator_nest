import { IUserPostLike } from '../interfaces'

class UserLikeInfoEntity implements IUserPostLike {
  public addedAt: Date

  constructor(
    public readonly userId: string,
    public readonly login: string,
  ) {
    this.addedAt = new Date()
  }
}

export { UserLikeInfoEntity }
