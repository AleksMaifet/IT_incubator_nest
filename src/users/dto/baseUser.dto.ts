import { IsNotEmpty, IsString, Matches, Validate } from 'class-validator'
import { IsUserNotExist } from '../../libs/customValidations'

class BaseUserDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'email must be a valid',
  })
  @Validate(IsUserNotExist, {
    message: 'users with this email exists',
  })
  readonly email: string
}

export { BaseUserDto }
