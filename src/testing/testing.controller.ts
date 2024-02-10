import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common'
import { TestingRepository } from './testing.repository'

@Controller('testing')
class TestingController {
  constructor(private readonly testingRepository: TestingRepository) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async cleanDBs() {
    return await this.testingRepository.deleteAll()
  }
}

export { TestingController }
