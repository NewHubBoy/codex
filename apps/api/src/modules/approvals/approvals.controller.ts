import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import type { Request } from "express";
import {
  ApproveApprovalTaskInputSchema,
  RejectApprovalTaskInputSchema
} from "@crm/shared";
import { parseListQuery } from "../../common/list-query";
import { getRequestContext } from "../../common/request-context";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  getSchemaPath
} from "@nestjs/swagger";
import { ApprovalsService } from "./approvals.service";
import { ApprovalActionDto, ApprovalInstanceDto, ApprovalTaskDto } from "./dto/approvals.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";

@ApiTags("approvals")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, ApprovalInstanceDto, ApprovalTaskDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller()
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get("approvals")
  @RequirePermissions("approval:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(ApprovalInstanceDto) }
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
    const entityId = typeof query.entityId === "string" ? query.entityId : undefined;
    return this.approvalsService.listInstances(ctx, listQuery, { entityType, entityId });
  }

  @Get("approvals/:id")
  @RequirePermissions("approval:read")
  @ApiOkResponse({ type: ApprovalInstanceDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.approvalsService.getInstance(ctx, id);
  }

  @Get("approval-tasks")
  @RequirePermissions("approval:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(ApprovalTaskDto) }
            }
          }
        }
      ]
    }
  })
  async listTasks(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    const entityType = typeof query.entityType === "string" ? query.entityType : undefined;
    const entityId = typeof query.entityId === "string" ? query.entityId : undefined;
    return this.approvalsService.listTasks(ctx, listQuery, { entityType, entityId });
  }

  @Post("approval-tasks/:id/approve")
  @RequirePermissions("approval:write")
  @ApiBody({ type: ApprovalActionDto })
  @ApiOkResponse({ type: ApprovalInstanceDto })
  async approve(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = ApproveApprovalTaskInputSchema.parse(body);
    return this.approvalsService.approveTask(ctx, id, input.note);
  }

  @Post("approval-tasks/:id/reject")
  @RequirePermissions("approval:write")
  @ApiBody({ type: ApprovalActionDto })
  @ApiOkResponse({ type: ApprovalInstanceDto })
  async reject(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = RejectApprovalTaskInputSchema.parse(body);
    return this.approvalsService.rejectTask(ctx, id, input.note);
  }
}
