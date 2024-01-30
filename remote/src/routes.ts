import * as fs from 'fs';
import { parseStringPromise } from 'xml2js';

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

	fastify.get("/vlc", async (request, _reply) => {
		const fullURL = `${config.vlcURL}/status.xml${request.url.substring(4)}`;

		try {
			const response = await fetch(fullURL, {
				headers: {
					Authorization: `Basic ${btoa(":playback")}`,
				},
			})

			return await parseStringPromise(await response.text(), {explicitArray: false});

		} catch(err) {
			console.log('ERROR')
			console.log(err.message);
		}

	});
}
