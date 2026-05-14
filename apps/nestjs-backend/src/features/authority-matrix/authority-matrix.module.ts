import { Module } from '@nestjs/common';
import { AuthorityPolicyService } from './authority-policy.service';

@Module({
  providers: [AuthorityPolicyService],
  exports: [AuthorityPolicyService],
})
export class AuthorityMatrixModule {}
