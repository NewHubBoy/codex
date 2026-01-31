import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import type { Request } from "express";
import {
  CreateProcessDefinitionInputSchema,
  CreateProcessStateInputSchema,
  CreateProcessTransitionInputSchema,
  UpdateProcessDefinitionInputSchema
} from "@crm/shared";
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
import { parseListQuery } from "../../common/list-query";
import { getRequestContext } from "../../common/request-context";
import { Public } from "../../common/decorators/public.decorator";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PaginatedResponseDto } from "../../common/swagger/pagination";
import { WorkflowsService } from "./workflows.service";
import {
  CreateStateDto,
  CreateTransitionDto,
  CreateWorkflowDto,
  ProcessStateDto,
  ProcessTransitionDto,
  UpdateWorkflowDto,
  WorkflowDto
} from "./dto/workflows.swagger";

@ApiTags("workflows")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, WorkflowDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("config/workflows")
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get("health")
  @Public()
  health() {
    return { status: "ok", module: "workflows" };
  }

  @Get()
  @RequirePermissions("config:workflow:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(WorkflowDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.workflowsService.list(ctx, listQuery);
  }

  @Post()
  @RequirePermissions("config:workflow:write")
  @ApiBody({ type: CreateWorkflowDto })
  @ApiCreatedResponse({ type: WorkflowDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateProcessDefinitionInputSchema.parse(body);
    return this.workflowsService.create(ctx, input);
  }

  @Get(":id")
  @RequirePermissions("config:workflow:read")
  @ApiOkResponse({ type: WorkflowDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.workflowsService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("config:workflow:write")
  @ApiBody({ type: UpdateWorkflowDto })
  @ApiOkResponse({ type: WorkflowDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateProcessDefinitionInputSchema.parse(body);
    return this.workflowsService.update(ctx, id, input);
  }

  @Post(":id/states")
  @RequirePermissions("config:workflow:write")
  @ApiBody({ type: CreateStateDto })
  @ApiCreatedResponse({ type: ProcessStateDto })
  async addState(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateProcessStateInputSchema.parse(body);
    return this.workflowsService.addState(ctx, id, input);
  }

  @Post(":id/transitions")
  @RequirePermissions("config:workflow:write")
  @ApiBody({ type: CreateTransitionDto })
  @ApiCreatedResponse({ type: ProcessTransitionDto })
  async addTransition(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateProcessTransitionInputSchema.parse(body);
    return this.workflowsService.addTransition(ctx, id, input);
  }
}
