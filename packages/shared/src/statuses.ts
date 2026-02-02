export const LEAD_STATUSES = [
  "NEW",
  "ASSIGNED",
  "WORKING",
  "QUALIFIED",
  "CONVERTED",
  "DISQUALIFIED"
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const OPPORTUNITY_STATUSES = ["OPEN", "WON", "LOST"] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const QUOTE_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED"
] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const ORDER_STATUSES = [
  "DRAFT",
  "CONFIRMED",
  "IN_FULFILLMENT",
  "PARTIALLY_DELIVERED",
  "DELIVERED",
  "CLOSED",
  "CANCELLED"
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const DELIVERY_STATUSES = ["PLANNED", "IN_TRANSIT", "DELIVERED", "COMPLETED"] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const TICKET_STATUSES = [
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
  "CANCELLED"
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const ACTIVITY_STATUSES = ["OPEN", "COMPLETED", "CANCELLED"] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
