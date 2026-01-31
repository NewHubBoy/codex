import { Injectable } from "@nestjs/common";

@Injectable()
export class TenantsService {
  health() {
    return { status: "ok", module: "tenants" };
  }
}
