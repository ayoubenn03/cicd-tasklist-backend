import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { vi } from "vitest";
import testPrisma from "./setup.js";

// Mock the prisma singleton to use the test client
vi.mock("../../lib/prisma.js", () => ({
	default: testPrisma,
}));

// Import app AFTER mocking prisma
const { default: app } = await import("../../app.js");
import request from "supertest";

describe("Task API E2E Tests", () => {
	beforeEach(async () => {
		// Clean up database between tests
		await testPrisma.task.deleteMany();
	});

	afterAll(async () => {
		await testPrisma.$disconnect();
	});

	describe("POST /api/tasks", () => {
		it("should create a new task", async () => {
			const res = await request(app)
				.post("/api/tasks")
				.send({ title: "E2E Task", description: "E2E Description" });

			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("id");
			expect(res.body.title).toBe("E2E Task");
			expect(res.body.description).toBe("E2E Description");
			expect(res.body.completed).toBe(false);
		});
	});

	// ... TODO: Add more tests
	describe("GET /api/tasks", () => {
	it("should return an empty array when there are no tasks", async () => {
		const res = await request(app).get("/api/tasks");

		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
	});

	it("should return all tasks", async () => {
		await testPrisma.task.create({ data: { title: "Task 1" } });
		await testPrisma.task.create({ data: { title: "Task 2" } });

		const res = await request(app).get("/api/tasks");

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(2);
	});
});

describe("GET /api/tasks/:id", () => {
	it("should return the task when found", async () => {
		const task = await testPrisma.task.create({ data: { title: "Findable Task" } });

		const res = await request(app).get(`/api/tasks/${task.id}`);

		expect(res.status).toBe(200);
		expect(res.body.title).toBe("Findable Task");
	});

	it("should return 404 when task does not exist", async () => {
		const res = await request(app).get("/api/tasks/999999");

		expect(res.status).toBe(404);
	});
});

describe("PUT /api/tasks/:id", () => {
	it("should update the task", async () => {
		const task = await testPrisma.task.create({ data: { title: "Old Title" } });

		const res = await request(app)
			.put(`/api/tasks/${task.id}`)
			.send({ title: "New Title", completed: true });

		expect(res.status).toBe(200);
		expect(res.body.title).toBe("New Title");
		expect(res.body.completed).toBe(true);
	});

	it("should return 404 when task does not exist", async () => {
		const res = await request(app)
			.put("/api/tasks/999999")
			.send({ title: "New Title" });

		expect(res.status).toBe(404);
	});
});

describe("DELETE /api/tasks/:id", () => {
	it("should delete the task", async () => {
		const task = await testPrisma.task.create({ data: { title: "To Delete" } });

		const res = await request(app).delete(`/api/tasks/${task.id}`);

		expect(res.status).toBe(204);

		const found = await testPrisma.task.findUnique({ where: { id: task.id } });
		expect(found).toBeNull();
	});

	it("should return 404 when task does not exist", async () => {
		const res = await request(app).delete("/api/tasks/999999");

		expect(res.status).toBe(404);
	});
});
});
