# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

强制说中文 叫我大人

## Project Overview

Modern B2B CRM monorepo (SAP C4C-like) with Next.js frontend and NestJS backend. Covers Lead → Opportunity → Quote → Order → Delivery → Ticket lifecycle.

## Commands

```bash
# Monorepo commands (run from root)
pnpm dev              # Run all apps in dev mode (turbo dev)
pnpm build            # Build all apps (turbo build)
pnpm lint             # Lint all apps (turbo lint)
pnpm format           # Format all apps (turbo format)

# Database (PostgreSQL via Docker)
docker-compose up -d  # Start database

# Shared package (required before API build)
pnpm -C packages/shared build   # Build shared types, Zod schemas, constants

# API commands (apps/api)
cd apps/api
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:seed      # Seed database
pnpm rbac:init        # Initialize RBAC roles/permissions
pnpm dev              # Start NestJS with hot reload
pnpm status:regress   # Run status transition regression tests
```

## Architecture

```
apps/web/          # Next.js 15 (App Router), Ant Design 5
apps/api/          # NestJS 10, Prisma 6, Swagger/OpenAPI
packages/shared/   # Shared Zod schemas, types, permissions, statuses
```

**Key backend patterns:**
- `src/common/services/data-scope.service.ts` - RBAC data filtering by org unit
- `src/common/services/numbering.service.ts` - NumberRange-based auto-numbering
- `src/common/services/outbox.service.ts` - Event outbox pattern for consistency
- `src/common/status-transitions.ts` - State machine validation
- `src/common/list-query.ts` - Standardized pagination/filtering

**Database:** Multi-tenant with `tenant_id` isolation. Every business table includes: `id, tenant_id, org_unit_id, owner_id, status, created_at, updated_at, created_by, updated_by`.

## Module Structure (apps/api/src/modules/)

| Module | Purpose |
|--------|---------|
| `auth/` | JWT + refresh token authentication |
| `rbac/` | Roles, permissions, data scopes |
| `users/` | User management |
| `org-units/` | Organization hierarchy |
| `leads/opportunities/accounts/contacts/` | Core CRM entities |
| `products/quotes/orders/deliveries/` | Sales pipeline |
| `tickets/activities/` | Service & tracking |
| `fields/` | Custom field definitions |
| `workflows/` | Process definitions |

## Shared Package (packages/shared/)

- `schemas/dto/*.ts` - Zod DTOs for validation
- `schemas/input/*.ts` - Creation/update input schemas
- `permissions.ts` - 36+ permission codes (e.g., `LEAD_CREATE`, `QUOTE_APPROVE`)
- `statuses.ts` - Status enums for all entities

## API Conventions

- REST: `/api/v1/{entity}` (e.g., `/api/v1/leads`)
- Query params: `page`, `pageSize`, `sort`, `q`, `status`, `owner_id`, `org_unit_id`
- Bulk operations: POST `/leads/bulk-status` (supports `dryRun`)

## Status Flows

- **Lead:** New → Assigned → Working → Qualified → Converted
- **Opportunity:** Qualification → Needs Analysis → Proposal → Negotiation → Won/Lost
- **Quote:** Draft → In Review → Approved → Sent → Accepted/Rejected
- **Order:** Draft → Confirmed → In Fulfillment → Delivered → Closed
- **Delivery:** Planned → In Transit → Delivered → Completed
- **Ticket:** New → Assigned → In Progress → Resolved → Closed
