# Attachment 关联查询说明

## 1. 关系模型（Prisma）

`Attachment` 和 `AttachmentLink` 是一对多关系：

```prisma
model Attachment {
  ...
  links AttachmentLink[]
}

model AttachmentLink {
  attachmentId String
  relatedType  String
  relatedId    String
  attachment   Attachment @relation(fields: [attachmentId], references: [id], onDelete: Cascade)

  @@unique([attachmentId, relatedType, relatedId])
}
```

- `AttachmentLink` 作为“多态关联表”，通过 `relatedType + relatedId` 指向任意业务对象。
- 一个附件可以挂多个对象（多条 AttachmentLink）。
- `@@unique([attachmentId, relatedType, relatedId])` 防止同一对象重复挂载同一附件。

## 2. 查询逻辑（relatedType / relatedId）

附件列表接口支持通过 `relatedType` / `relatedId` 过滤。服务端在查询里使用 Prisma 的关系过滤：

```ts
const linkFilter: Record<string, string> = {};
if (query.relatedType) linkFilter.relatedType = query.relatedType;
if (query.relatedId) linkFilter.relatedId = query.relatedId;

const where = {
  ...,
  ...(Object.keys(linkFilter).length ? { links: { some: linkFilter } } : {}),
};
```

含义：
- 仅传 `relatedType`：获取该类型下所有附件。
- 仅传 `relatedId`：获取该 ID 关联的所有附件（不限定类型）。
- 同时传：精确匹配该对象的附件。
- 都不传：不按关联过滤（仍受租户/组织/权限过滤）。

## 3. Prisma 查询的等价 SQL（概念）

```sql
SELECT *
FROM Attachment a
WHERE a.tenant_id = ?
  AND EXISTS (
    SELECT 1
    FROM AttachmentLink al
    WHERE al.attachment_id = a.id
      AND al.related_type = ?
      AND al.related_id = ?
  );
```

## 4. 删除行为

`AttachmentLink` 上设置了 `onDelete: Cascade`，删除附件时会自动清理关联记录。
