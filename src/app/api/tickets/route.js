"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
var prisma_1 = require("@/lib/prisma");
var authorization_1 = require("@/lib/authorization");
var rate_limit_1 = require("@/lib/rate-limit");
var logger_1 = require("@/lib/logger");
var sanitize_1 = require("@/lib/sanitize");
var ticket_list_1 = require("@/lib/ticket-list");
var sla_policy_1 = require("@/lib/sla-policy");
var sla_preview_1 = require("@/lib/sla-preview");
var sla_scheduler_1 = require("@/lib/sla-scheduler");
var server_1 = require("next/server");
var zod_1 = require("zod");
var client_1 = require("@prisma/client");
var createSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    descriptionMd: zod_1.z.string().min(3),
    priority: zod_1.z.nativeEnum(client_1.TicketPriority),
    category: zod_1.z.string().optional(),
});
var querySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    cursor: zod_1.z.string().optional(),
    direction: zod_1.z.enum(["next", "prev"]).optional(),
    status: zod_1.z.nativeEnum(client_1.TicketStatus).optional(),
    priority: zod_1.z.nativeEnum(client_1.TicketPriority).optional(),
    q: zod_1.z.string().optional(),
});
function GET(req) {
    return __awaiter(this, void 0, void 0, function () {
        var auth, logger, url, parsedQuery, _a, limit, cursor, direction, status, priority, q, page;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, authorization_1.requireAuth)()];
                case 1:
                    auth = _c.sent();
                    logger = (0, logger_1.createRequestLogger)({
                        route: "/api/tickets",
                        method: (_b = req === null || req === void 0 ? void 0 : req.method) !== null && _b !== void 0 ? _b : "GET",
                        userId: auth.ok ? auth.user.id : undefined,
                    });
                    if (!auth.ok) {
                        logger.warn("auth.required");
                        return [2 /*return*/, auth.response];
                    }
                    url = req ? new URL(req.url) : null;
                    parsedQuery = url
                        ? querySchema.safeParse(Object.fromEntries(url.searchParams.entries()))
                        : { success: true, data: {} };
                    if (!parsedQuery.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: parsedQuery.error.flatten() }, { status: 400 })];
                    }
                    _a = parsedQuery.data, limit = _a.limit, cursor = _a.cursor, direction = _a.direction, status = _a.status, priority = _a.priority, q = _a.q;
                    return [4 /*yield*/, (0, ticket_list_1.getTicketPage)(auth.user, {
                            limit: limit,
                            cursor: cursor,
                            direction: direction,
                            status: status,
                            priority: priority,
                            search: (q === null || q === void 0 ? void 0 : q.trim()) || undefined,
                        })];
                case 2:
                    page = _c.sent();
                    logger.info("tickets.list.success", {
                        count: page.tickets.length,
                        role: auth.user.role,
                    });
                    return [2 /*return*/, server_1.NextResponse.json(page)];
            }
        });
    });
}
function POST(req) {
    return __awaiter(this, void 0, void 0, function () {
        var auth, logger, rate, body, parsed, sanitizedDescription, sla, _a, firstResponseDue, resolveDue, ticket, evaluateAutomationRules;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, authorization_1.requireAuth)()];
                case 1:
                    auth = _d.sent();
                    logger = (0, logger_1.createRequestLogger)({
                        route: "/api/tickets",
                        method: req.method,
                        userId: auth.ok ? auth.user.id : undefined,
                    });
                    if (!auth.ok) {
                        logger.warn("auth.required");
                        return [2 /*return*/, auth.response];
                    }
                    rate = (0, rate_limit_1.checkRateLimit)(req, "tickets:create", {
                        logger: logger,
                        identifier: auth.ok ? auth.user.id : undefined,
                    });
                    if (!rate.allowed)
                        return [2 /*return*/, rate.response];
                    return [4 /*yield*/, req.json()];
                case 2:
                    body = _d.sent();
                    parsed = createSchema.safeParse(body);
                    if (!parsed.success) {
                        logger.warn("tickets.create.validation_failed");
                        return [2 /*return*/, server_1.NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })];
                    }
                    sanitizedDescription = (0, sanitize_1.sanitizeMarkdown)(parsed.data.descriptionMd);
                    return [4 /*yield*/, (0, sla_policy_1.findSlaPolicyForTicket)((_b = auth.user.organizationId) !== null && _b !== void 0 ? _b : "", parsed.data.priority, parsed.data.category)];
                case 3:
                    sla = _d.sent();
                    _a = (0, sla_preview_1.computeSlaDueDates)(sla), firstResponseDue = _a.firstResponseDue, resolveDue = _a.resolveDue;
                    return [4 /*yield*/, prisma_1.prisma.ticket.create({
                            data: {
                                title: parsed.data.title,
                                descriptionMd: sanitizedDescription,
                                priority: parsed.data.priority,
                                category: parsed.data.category,
                                status: client_1.TicketStatus.NOWE,
                                requesterId: auth.user.id,
                                organizationId: (_c = auth.user.organizationId) !== null && _c !== void 0 ? _c : "",
                                firstResponseDue: firstResponseDue,
                                resolveDue: resolveDue,
                                auditEvents: {
                                    create: {
                                        actorId: auth.user.id,
                                        action: "TICKET_CREATED",
                                        data: {
                                            status: client_1.TicketStatus.NOWE,
                                            priority: parsed.data.priority,
                                        },
                                    },
                                },
                            },
                        })];
                case 4:
                    ticket = _d.sent();
                    logger.info("tickets.create.success", {
                        ticketId: ticket.id,
                        priority: ticket.priority,
                    });
                    return [4 /*yield*/, (0, sla_scheduler_1.scheduleSlaJobsForTicket)({
                            id: ticket.id,
                            organizationId: ticket.organizationId,
                            priority: ticket.priority,
                            requesterId: ticket.requesterId,
                            firstResponseDue: ticket.firstResponseDue,
                            resolveDue: ticket.resolveDue,
                        })];
                case 5:
                    _d.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/automation-rules"); })];
                case 6:
                    evaluateAutomationRules = (_d.sent()).evaluateAutomationRules;
                    return [4 /*yield*/, evaluateAutomationRules({
                            type: "ticketCreated",
                            ticket: ticket,
                        })];
                case 7:
                    _d.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ ticket: ticket })];
            }
        });
    });
}
