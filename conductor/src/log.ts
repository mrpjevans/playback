import pino from "pino";

import { env } from "./env";

export const log = pino({
	level: env.logLevel,
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
		},
	},
});
