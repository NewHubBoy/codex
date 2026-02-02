# CRM Monorepo

## Common Build Commands

```bash
# build shared types (used by API/Web)
pnpm -C packages/shared build

# generate Prisma Client (after schema changes)
pnpm -C apps/api exec prisma generate
```

## Prisma Commands (API)

```bash
# create/apply a new migration in dev
pnpm -C apps/api exec prisma migrate dev --name <migration_name>

# reset database (drops data) + reapply migrations + run seed
pnpm -C apps/api exec prisma migrate reset --force

# run seed only
pnpm -C apps/api exec prisma db seed
```
