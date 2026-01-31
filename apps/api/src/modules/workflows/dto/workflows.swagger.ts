import { ApiProperty } from "@nestjs/swagger";

export class ProcessStateDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  processId!: string;

  @ApiProperty()
  stateKey!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({ required: false })
  category?: string | null;

  @ApiProperty()
  sortOrder!: number;
}

export class ProcessTransitionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  processId!: string;

  @ApiProperty()
  fromState!: string;

  @ApiProperty()
  toState!: string;

  @ApiProperty({ required: false })
  conditionExpr?: string | null;

  @ApiProperty({ required: false })
  requiredRoles?: string | null;
}

export class WorkflowDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: ProcessStateDto, isArray: true })
  states!: ProcessStateDto[];

  @ApiProperty({ type: ProcessTransitionDto, isArray: true })
  transitions!: ProcessTransitionDto[];
}

export class CreateWorkflowDto {
  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  isActive?: boolean;
}

export class UpdateWorkflowDto {
  @ApiProperty({ required: false })
  entityType?: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  isActive?: boolean;
}

export class CreateStateDto {
  @ApiProperty()
  stateKey!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty({ required: false })
  sortOrder?: number;
}

export class CreateTransitionDto {
  @ApiProperty()
  fromState!: string;

  @ApiProperty()
  toState!: string;

  @ApiProperty({ required: false })
  conditionExpr?: string;

  @ApiProperty({ required: false })
  requiredRoles?: string;
}
