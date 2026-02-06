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
  AssignApprovalTasksInputSchema,
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
import {
  ApprovalActionDto,
  ApprovalAssignDto,
  ApprovalInstanceDto,
  ApprovalTaskDto
} from "./dto/approvals.swagger";
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
    const roleCode = typeof query.roleCode === "string" ? query.roleCode : undefined;
    const assigneeId = typeof query.assigneeId === "string" ? query.assigneeId : undefined;
    const createdFrom =
      typeof query.createdFrom === "string" ? new Date(query.createdFrom) : undefined;
    const createdTo = typeof query.createdTo === "string" ? new Date(query.createdTo) : undefined;
    return this.approvalsService.listTasks(ctx, listQuery, {
      entityType,
      entityId,
      roleCode,
      assigneeId,
      createdFrom: createdFrom && !Number.isNaN(createdFrom.valueOf()) ? createdFrom : undefined,
      createdTo: createdTo && !Number.isNaN(createdTo.valueOf()) ? createdTo : undefined
    });
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

  @Post("approval-tasks/assign")
  @RequirePermissions("approval:write")
  @ApiBody({ type: ApprovalAssignDto })
  @ApiOkResponse({ schema: { properties: { updated: { type: "number" } } } })
  async assign(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = AssignApprovalTasksInputSchema.parse(body);
    return this.approvalsService.assignTasks(ctx, input);
  }
}
