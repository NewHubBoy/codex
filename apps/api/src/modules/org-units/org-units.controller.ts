import { Controller, Get } from "@nestjs/common";
import { OrgUnitsService } from "./org-units.service";

@Controller("org-units")
export class OrgUnitsController {
  constructor(private readonly orgUnitsService: OrgUnitsService) {}

  @Get("health")
  health() {
    return this.orgUnitsService.health();
  }
}
