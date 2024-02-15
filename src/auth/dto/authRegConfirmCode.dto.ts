import { IsNotEmpty, IsString, Validate } from 'class-validator'
import { CustomUpdatedPassValidationByRecoveryCode } from './authUpdatePass.dto'

class AuthRegConfirmCodeDto {
  @IsNotEmpty()
  @IsString()
  @Validate(CustomUpdatedPassValidationByRecoveryCode)
  readonly code: string
}

export { AuthRegConfirmCodeDto }
