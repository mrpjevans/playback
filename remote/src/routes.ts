import * as fs from 'fs';

import { config } from './config';

export async function routes(fastify, _options) {
	fastify.get("/", async (_request, reply) => {
		return reply.view("index");
	});

	fastify.get("/files", async (request, reply) => {
		const root:string = config.mediaDir;
		let path:string = root;
		let partial = "";
		if (request.query.path) {
			if ((request.query.path as String).includes("..")) {
				throw new Error("Invalid path");
			}
			path += request.query.path;
			partial = request.query.path;
		}
		const allItems = fs.readdirSync(path);
    const items = allItems.sort().filter((item) => !item.startsWith('.')).map(item => {
			const stat = fs.statSync(`${path}/${item}`);
			return {
				name: item,
				relPath: `${partial}/${item}`,
				absPath: `${path}/${item}`,
				isDirectory: stat.isDirectory()
			};
		});
		const back = partial !== "" ? partial.split("/").slice(0,-1).join("/") : false;
		return reply.view("files", { items, path, partial, root, back });
	});

	fastify.get("/vlc", async (request, reply) => {
		const fullURL = config.vlcURL + request.url.substring(4);

		try {
			console.log(fullURL)
			const response = await fetch(fullURL, {
				headers: {
					Authorization: `Basic ${btoa(":playback")}`,
				},
				credentials: "include",
			})
			reply.headers({
				"Content-type": "text/xml"
			})
			return await response.text();
		} catch(err) {
			console.log('ERROR')
			console.log(err.message);
		}

	});
}
