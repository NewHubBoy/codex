import { Injectable } from "@nestjs/common";

@Injectable()
export class RbacService {
  health() {
    return { status: "ok", module: "rbac" };
  }
}
