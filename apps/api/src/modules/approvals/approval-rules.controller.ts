import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import type { Request } from "express";
import {
  CreateApprovalRuleInputSchema,
  TestApprovalRuleInputSchema,
  UpdateApprovalRuleInputSchema
} from "@crm/shared";
import { parseListQuery } from "../../common/list-query";
import { getRequestContext } from "../../common/request-context";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  getSchemaPath
} from "@nestjs/swagger";
import { ApprovalRulesService } from "./approval-rules.service";
import {
  ApprovalRuleDto,
  ApprovalRuleStepDto,
  CreateApprovalRuleDto,
  TestApprovalRuleDto,
  UpdateApprovalRuleDto
} from "./dto/approval-rules.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";

@ApiTags("approval-rules")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, ApprovalRuleDto, ApprovalRuleStepDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("approval-rules")
export class ApprovalRulesController {
  constructor(private readonly approvalRulesService: ApprovalRulesService) {}

  @Get()
  @RequirePermissions("config:approval:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(ApprovalRuleDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    const entityType = typeof query.entityType === "string" ? query.entityType : undefined;
    const isActiveRaw = query.isActive;
    const isActive =
      isActiveRaw === "true" || isActiveRaw === "1" ? true : isActiveRaw === "false" ? false : undefined;
    return this.approvalRulesService.list(ctx, listQuery, { entityType, isActive });
  }

  @Get(":id")
  @RequirePermissions("config:approval:read")
  @ApiOkResponse({ type: ApprovalRuleDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.approvalRulesService.get(ctx, id);
  }

  @Post()
  @RequirePermissions("config:approval:write")
  @ApiBody({ type: CreateApprovalRuleDto })
  @ApiCreatedResponse({ type: ApprovalRuleDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateApprovalRuleInputSchema.parse(body);
    return this.approvalRulesService.create(ctx, input);
  }

  @Put(":id")
  @RequirePermissions("config:approval:write")
  @ApiBody({ type: UpdateApprovalRuleDto })
  @ApiOkResponse({ type: ApprovalRuleDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateApprovalRuleInputSchema.parse(body);
    return this.approvalRulesService.update(ctx, id, input);
  }

  @Post("test")
  @RequirePermissions("config:approval:read")
  @ApiBody({ type: TestApprovalRuleDto })
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        matched: { type: "boolean" },
        rule: { $ref: getSchemaPath(ApprovalRuleDto) },
        steps: { type: "array", items: { $ref: getSchemaPath(ApprovalRuleStepDto) } }
      }
    }
  })
  async test(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = TestApprovalRuleInputSchema.parse(body);
    return this.approvalRulesService.test(ctx, input);
  }
}
