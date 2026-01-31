import { ApiProperty } from "@nestjs/swagger";

export class FieldDefinitionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  fieldKey!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  dataType!: string;

  @ApiProperty()
  required!: boolean;

  @ApiProperty({ required: false })
  optionsJson?: Record<string, unknown> | null;

  @ApiProperty({ required: false })
  validationJson?: Record<string, unknown> | null;
}

export class CreateFieldDefinitionDto {
  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  fieldKey!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  dataType!: string;

  @ApiProperty({ required: false })
  required?: boolean;

  @ApiProperty({ required: false, type: Object })
  optionsJson?: Record<string, unknown>;

  @ApiProperty({ required: false, type: Object })
  validationJson?: Record<string, unknown>;
}

export class UpdateFieldDefinitionDto {
  @ApiProperty({ required: false })
  entityType?: string;

  @ApiProperty({ required: false })
  fieldKey?: string;

  @ApiProperty({ required: false })
  label?: string;

  @ApiProperty({ required: false })
  dataType?: string;

  @ApiProperty({ required: false })
  required?: boolean;

  @ApiProperty({ required: false, type: Object })
  optionsJson?: Record<string, unknown>;

  @ApiProperty({ required: false, type: Object })
  validationJson?: Record<string, unknown>;
}

export class FieldGroupDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  groupName!: string;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty({ required: false })
  layoutJson?: Record<string, unknown> | null;
}

export class CreateFieldGroupDto {
  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  groupName!: string;

  @ApiProperty({ required: false })
  sortOrder?: number;

  @ApiProperty({ required: false, type: Object })
  layoutJson?: Record<string, unknown>;
}

export class UpdateFieldGroupDto {
  @ApiProperty({ required: false })
  entityType?: string;

  @ApiProperty({ required: false })
  groupName?: string;

  @ApiProperty({ required: false })
  sortOrder?: number;

  @ApiProperty({ required: false, type: Object })
  layoutJson?: Record<string, unknown>;
}
