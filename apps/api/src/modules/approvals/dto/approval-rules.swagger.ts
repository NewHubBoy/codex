import { ApiProperty } from "@nestjs/swagger";

const ENTITY_TYPES = ["Quote", "Order"] as const;
const OPERATORS = ["EQ", "NEQ", "GT", "GTE", "LT", "LTE", "IN", "NOT_IN"] as const;
const FIELDS = ["discountRate", "amount", "isCustom", "hasSpecialTerms"] as const;

export class ApprovalRuleConditionDto {
  @ApiProperty({ enum: FIELDS })
  field!: string;

  @ApiProperty({ enum: OPERATORS })
  operator!: string;

  @ApiProperty()
  value!: unknown;
}

export class ApprovalRuleStepDto {
  @ApiProperty()
  roleCode!: string;

  @ApiProperty({ required: false })
  groupIndex?: number;

  @ApiProperty({ required: false })
  sortOrder?: number;
}

export class ApprovalRuleDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ enum: ENTITY_TYPES })
  entityType!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  priority!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ required: false })
  effectiveFrom?: string | null;

  @ApiProperty({ required: false })
  effectiveTo?: string | null;

  @ApiProperty({ type: [ApprovalRuleConditionDto], required: false })
  conditions?: ApprovalRuleConditionDto[];

  @ApiProperty({ type: [ApprovalRuleStepDto], required: false })
  steps?: ApprovalRuleStepDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CreateApprovalRuleDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ENTITY_TYPES })
  entityType!: string;

  @ApiProperty({ required: false })
  priority?: number;

  @ApiProperty({ required: false })
  isActive?: boolean;

  @ApiProperty({ required: false })
  effectiveFrom?: string;

  @ApiProperty({ required: false })
  effectiveTo?: string;

  @ApiProperty({ type: [ApprovalRuleConditionDto] })
  conditions!: ApprovalRuleConditionDto[];

  @ApiProperty({ type: [ApprovalRuleStepDto] })
  steps!: ApprovalRuleStepDto[];
}

export class UpdateApprovalRuleDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ enum: ENTITY_TYPES, required: false })
  entityType?: string;

  @ApiProperty({ required: false })
  priority?: number;

  @ApiProperty({ required: false })
  isActive?: boolean;

  @ApiProperty({ required: false })
  effectiveFrom?: string;

  @ApiProperty({ required: false })
  effectiveTo?: string;

  @ApiProperty({ type: [ApprovalRuleConditionDto], required: false })
  conditions?: ApprovalRuleConditionDto[];

  @ApiProperty({ type: [ApprovalRuleStepDto], required: false })
  steps?: ApprovalRuleStepDto[];
}

export class TestApprovalRuleDto {
  @ApiProperty({ enum: ENTITY_TYPES })
  entityType!: string;

  @ApiProperty({
    type: "object",
    properties: {
      discountRate: { type: "number" },
      amount: { type: "number" },
      isCustom: { type: "boolean" },
      hasSpecialTerms: { type: "boolean" }
    }
  })
  payload!: Record<string, unknown>;
}
