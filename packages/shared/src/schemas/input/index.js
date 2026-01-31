"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./account.input"), exports);
__exportStar(require("./contact.input"), exports);
__exportStar(require("./lead.input"), exports);
__exportStar(require("./opportunity.input"), exports);
__exportStar(require("./quote.input"), exports);
__exportStar(require("./order.input"), exports);
__exportStar(require("./ticket.input"), exports);
__exportStar(require("./delivery.input"), exports);
__exportStar(require("./product.input"), exports);
__exportStar(require("./price-book.input"), exports);
__exportStar(require("./activity.input"), exports);
