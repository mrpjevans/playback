import * as fs from 'fs';

import { config } from './config';

export async function routes(fastify, _options) {
	fastify.get("/", async (_request, reply) => {
		return reply.view("index");
	});
	fastify.get("/files", async (_request, reply) => {
		const allItems = fs.readdirSync(config.mediaDir);
    const items = allItems.filter((item) => !item.startsWith('.'));
		return reply.view("files", { items });
	});
}
