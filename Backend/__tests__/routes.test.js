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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
jest.mock('../src/middleware/auth.middleware', () => ({
    requireAuth: (req, res, next) => next()
}));
const chat_routes_1 = __importDefault(require("../src/routes/chat.routes"));
const transactions_routes_1 = __importDefault(require("../src/routes/transactions.routes"));
const receipts_routes_1 = __importDefault(require("../src/routes/receipts.routes"));
const budgets_routes_1 = __importDefault(require("../src/routes/budgets.routes"));
const dashboard_routes_1 = __importDefault(require("../src/routes/dashboard.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/v1/chat', chat_routes_1.default);
app.use('/api/v1/transactions', transactions_routes_1.default);
app.use('/api/v1/receipts', receipts_routes_1.default);
app.use('/api/v1/budgets', budgets_routes_1.default);
app.use('/api/v1/dashboard', dashboard_routes_1.default);
describe('API Routes Execution Time & CRUD Operations', () => {
    const checkTime = (start, end, route, method) => {
        const duration = end - start;
        expect(duration).toBeLessThan(150); // Setting to 150ms to comfortably pass cold starts in CI
        console.log(`[Time] ${method} ${route} took ${duration.toFixed(2)}ms`);
    };
    const resources = ['transactions', 'receipts', 'budgets'];
    resources.forEach(res => {
        describe(`/api/v1/${res}`, () => {
            it('GET should resolve in < 150ms', () => __awaiter(void 0, void 0, void 0, function* () {
                const start = performance.now();
                const response = yield (0, supertest_1.default)(app).get(`/api/v1/${res}`);
                checkTime(start, performance.now(), `/api/v1/${res}`, 'GET');
                expect(response.status).toBe(200);
            }));
            it('POST should resolve in < 150ms', () => __awaiter(void 0, void 0, void 0, function* () {
                const start = performance.now();
                const response = yield (0, supertest_1.default)(app).post(`/api/v1/${res}`).send({});
                checkTime(start, performance.now(), `/api/v1/${res}`, 'POST');
                expect(response.status).toBe(201);
            }));
            it('PUT should resolve in < 150ms', () => __awaiter(void 0, void 0, void 0, function* () {
                const start = performance.now();
                const response = yield (0, supertest_1.default)(app).put(`/api/v1/${res}/123`).send({});
                checkTime(start, performance.now(), `/api/v1/${res}/123`, 'PUT');
                expect(response.status).toBe(200);
            }));
            it('DELETE should resolve in < 150ms', () => __awaiter(void 0, void 0, void 0, function* () {
                const start = performance.now();
                const response = yield (0, supertest_1.default)(app).delete(`/api/v1/${res}/123`);
                checkTime(start, performance.now(), `/api/v1/${res}/123`, 'DELETE');
                expect(response.status).toBe(200);
            }));
        });
    });
    describe('/api/v1/chat', () => {
        it('GET should resolve in < 150ms', () => __awaiter(void 0, void 0, void 0, function* () {
            const start = performance.now();
            const response = yield (0, supertest_1.default)(app).get('/api/v1/chat');
            checkTime(start, performance.now(), '/api/v1/chat', 'GET');
            expect(response.status).toBe(200);
        }));
        it('POST should resolve in < 150ms', () => __awaiter(void 0, void 0, void 0, function* () {
            const start = performance.now();
            const response = yield (0, supertest_1.default)(app).post('/api/v1/chat').send({});
            checkTime(start, performance.now(), '/api/v1/chat', 'POST');
            expect(response.status).toBe(201);
        }));
    });
    describe('/api/v1/dashboard', () => {
        it('GET should resolve in < 150ms', () => __awaiter(void 0, void 0, void 0, function* () {
            const start = performance.now();
            const response = yield (0, supertest_1.default)(app).get('/api/v1/dashboard');
            checkTime(start, performance.now(), '/api/v1/dashboard', 'GET');
            expect(response.status).toBe(200);
        }));
    });
});
