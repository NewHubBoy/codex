import { Body, Controller, Get, Put, Query, Req, UseGuards, BadRequestException } from "@nestjs/common";
import type { Request } from "express";
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { UpdateAlertSettingInputSchema } from "@crm/shared";
import { getRequestContext } from "../../common/request-context";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { AlertsService } from "./alerts.service";
import { AlertSettingDto, AlertSummaryDto, UpdateAlertSettingDto } from "./dto/alerts.swagger";

@ApiTags("alerts")
@ApiBearerAuth()
@ApiSecurity("tenant")
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("alerts")
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get("summary")
  @RequirePermissions("lead:read", "opportunity:read")
  @ApiOkResponse({ type: AlertSummaryDto })
  async summary(
    @Req() req: Request,
    @Query("inactiveDays") inactiveDays?: string,
    @Query("staleDays") staleDays?: string
  ) {
    const ctx = getRequestContext(req);
    const parsedInactive = inactiveDays ? Number(inactiveDays) : undefined;
    const parsedStale = staleDays ? Number(staleDays) : undefined;
    return this.alertsService.getSummary(ctx, {
      inactiveDays: Number.isFinite(parsedInactive) ? parsedInactive : undefined,
      staleDays: Number.isFinite(parsedStale) ? parsedStale : undefined
    });
  }

  @Get("settings")
  @RequirePermissions("lead:read", "opportunity:read")
  @ApiOkResponse({ type: AlertSettingDto })
  async getSettings(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.alertsService.getEffectiveSettings(ctx);
  }

  @Put("settings")
  @RequirePermissions("alert:write")
  @ApiBody({ type: UpdateAlertSettingDto })
  @ApiOkResponse({ type: AlertSettingDto })
  async upsertSettings(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateAlertSettingInputSchema.parse(body);
    const saved = await this.alertsService.upsertSetting(ctx, input);
    if (!saved) {
      throw new BadRequestException("Missing scope for alert settings.");
    }
    return {
      inactiveDays: saved.inactiveDays,
      staleDays: saved.staleDays,
      scopeType: saved.scopeType,
      scopeId: saved.scopeId
    };
  }
}
