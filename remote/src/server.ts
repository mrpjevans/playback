import * as path from "path";

import Fastify from "fastify";
import * as fastifyStatic from "@fastify/static";
import * as fastifyView from "@fastify/view";
import * as fastifyForm from "@fastify/formbody";
import * as fastifyBasicAuth from "@fastify/basic-auth";
import * as ejs from "ejs";

import { config } from "./config";
import { routes } from "./routes";

const fastify = Fastify({
	logger: true,
});

fastify.register(fastifyStatic, {
	root: path.join(__dirname, "static"),
	prefix: "/static/",
});

fastify.register(fastifyView, {
	engine: {
		ejs,
	},
	root: `${__dirname}/templates`,
	layout: "layout",
	defaultContext: { config },
	includeViewExtension: true,
});

fastify.addHook("onSend", async (req, reply, _done) => {
	reply.header("Cache-Control", "no-cache, no-store, must-revalidate");
	reply.header("Pragma", "no-cache");
	reply.header("Expires", "0");
});

fastify.register(fastifyForm);

const authenticate = { realm: "playback" };
fastify.register(fastifyBasicAuth, { validate, authenticate });
function validate(username, password, req, reply, done) {
	if (username === config.webUsername && password === config.webPassword) {
		done();
	} else {
		done(new Error("Auth failed"));
	}
}

fastify.register(routes);

const start = async () => {
	try {
		await fastify.listen({ port: config.port, host: "0.0.0.0" });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
