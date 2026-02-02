import { BadRequestException } from "@nestjs/common";

const leadTransitions: Record<string, string[]> = {
  NEW: ["ASSIGNED", "WORKING", "DISQUALIFIED"],
  ASSIGNED: ["WORKING", "QUALIFIED", "DISQUALIFIED"],
  WORKING: ["QUALIFIED", "DISQUALIFIED"],
  QUALIFIED: ["CONVERTED", "DISQUALIFIED"],
  CONVERTED: [],
  DISQUALIFIED: []
};

const opportunityTransitions: Record<string, string[]> = {
  OPEN: ["WON", "LOST"],
  WON: [],
  LOST: []
};

const quoteTransitions: Record<string, string[]> = {
  DRAFT: ["IN_REVIEW", "SENT"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["SENT"],
  SENT: ["ACCEPTED", "REJECTED", "EXPIRED"],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: []
};

const orderTransitions: Record<string, string[]> = {
  DRAFT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_FULFILLMENT", "CANCELLED"],
  IN_FULFILLMENT: ["PARTIALLY_DELIVERED", "DELIVERED", "CANCELLED"],
  PARTIALLY_DELIVERED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: []
};

const deliveryTransitions: Record<string, string[]> = {
  PLANNED: ["IN_TRANSIT", "DELIVERED"],
  IN_TRANSIT: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: []
};

const ticketTransitions: Record<string, string[]> = {
  NEW: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["WAITING_CUSTOMER", "RESOLVED", "CANCELLED"],
  WAITING_CUSTOMER: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: []
};

const activityTransitions: Record<string, string[]> = {
  OPEN: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: []
};

const productTransitions: Record<string, string[]> = {
  ACTIVE: ["INACTIVE"],
  INACTIVE: ["ACTIVE"]
};

export function assertTransition(
  entity: string,
  fromStatus: string,
  toStatus: string
) {
  if (fromStatus === toStatus) {
    return;
  }
  const map = getTransitionMap(entity);
  const allowed = map[fromStatus] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new BadRequestException(
      `Invalid ${entity} status transition: ${fromStatus} -> ${toStatus}`
    );
  }
}

function getTransitionMap(entity: string): Record<string, string[]> {
  switch (entity) {
    case "Lead":
      return leadTransitions;
    case "Opportunity":
      return opportunityTransitions;
    case "Quote":
      return quoteTransitions;
    case "Order":
      return orderTransitions;
    case "Delivery":
      return deliveryTransitions;
    case "Ticket":
      return ticketTransitions;
    case "Activity":
      return activityTransitions;
    case "Product":
      return productTransitions;
    default:
      return {};
  }
}
