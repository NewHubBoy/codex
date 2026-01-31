import { Injectable } from "@nestjs/common";
import type { HealthResponse } from "@crm/shared";

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return { status: "ok", service: "crm-api" };
  }
}
