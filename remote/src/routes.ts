import * as fs from "fs";
import { execSync } from "child_process";

import { parseStringPromise } from "xml2js";

import { config } from "./config";
import {
	scanForWifiNetworksWithIw,
	connectToWifi,
	deleteConnection,
	getConnections,
} from "./lib/nmcli";

export async function routes(fastify, _options) {
	fastify.get("/", async (_request, reply) => {
		return reply.view("index");
	});

	fastify.get("/files", async (request, reply) => {
		const root: string = config.mediaDir;
		let path: string = root;
		let partial = "";
		if (request.query.path) {
			if ((request.query.path as string).includes("..")) {
				throw new Error("Invalid path");
			}
			path += request.query.path;
			partial = request.query.path;
		}
		const allItems = fs.readdirSync(path);
		const items = allItems
			.sort()
			.filter((item) => !item.startsWith("."))
			.map((item) => {
				const stat = fs.statSync(`${path}/${item}`);
				return {
					name: item,
					relPath: `${partial}/${item}`,
					absPath: `${path}/${item}`,
					isDirectory: stat.isDirectory(),
				};
			});
		const back =
			partial !== "" ? partial.split("/").slice(0, -1).join("/") : false;
		return reply.view("files", { items, path, partial, root, back });
	});

	fastify.get("/vlc", async (request, reply) => {
		const fullURL = `${config.vlcURL}/status.xml${request.url.substring(4)}`;

		try {
			const response = await fetch(fullURL, {
				headers: {
					Authorization: `Basic ${btoa(":playback")}`,
				},
			});

			return await parseStringPromise(await response.text(), {
				explicitArray: false,
			});
		} catch (err) {
			reply.status(500);
			return err.message;
		}
	});

	fastify.get("/settings", async (_request, reply) => {
		return reply.view("settings");
	});

	//
	// Power
	//
	fastify.get("/reboot", async (_request, reply) => {
		execSync(`sudo reboot`);
		reply.status(204);
	});

	fastify.get("/poweroff", async (_request, reply) => {
		execSync(`sudo poweroff`);
		reply.status(204);
	});

	//
	// Wifi
	//

	fastify.get("/wifi/", async (_request, reply) => {
		return reply.view("wifi/index", {
			connections: await getConnections(),
			hotspotName: config.wifi.hotspotName,
		});
	});

	fastify.get("/wifi/ssids", (_request, reply) => {
		setTimeout(() => {
			const networks = scanForWifiNetworksWithIw(config.wifi.wifiDevice);
			return reply.view("wifi/ssids", { networks });
		}, 2000);
	});

	fastify.post("/wifi/confirm", async (request, reply) => {
		const ssid =
			request.body.hidden_ssid !== ""
				? request.body.hidden_ssid
				: request.body.ssid;
		return reply.view("wifi/confirm", {
			ssid,
			password: request.body.password,
		});
	});

	fastify.post("/wifi/connect", async (request, reply) => {
		if (config.wifi?.dev === true) return reply.view("wifi/connect");

		try {
			deleteConnection(request.body.ssid);
		} catch (err) {}

		try {
			connectToWifi(request.body.ssid, request.body.password);
		} catch (err) {
			return reply.view("error", { message: err.message });
		}

		return reply.view("wifi/connect");
	});
}
