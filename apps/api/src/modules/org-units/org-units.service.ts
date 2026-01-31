import { Injectable } from "@nestjs/common";

@Injectable()
export class OrgUnitsService {
  health() {
    return { status: "ok", module: "org-units" };
  }
}
