import * as fs from "fs";
import { join } from "path";

import * as Joi from "joi";

// import { env } from "./env";
import { Composition } from "./interfaces";
import { log } from "./log";

let composition: Composition;

export function getComposition(configPath = null) {
	const filePath = configPath ?? `${__dirname}/composition.json`;

	log.info(`Loading composition from ${filePath}`);
	if (!fs.existsSync(filePath)) {
		log.error(`Composition file not found: ${filePath}`);
		process.exit();
	}

	try {
		composition = JSON.parse(fs.readFileSync(filePath).toString());
	} catch (err) {
		log.fatal(`Could not parse ${filePath}`);
		log.fatal(`Error: ${err.message}`);
	}

	if (!composition.basePath) {
		composition.basePath = join(__dirname, "..", "media");
		log.info(`Base path set to ${composition.basePath}`);
	} else if (!fs.existsSync(composition.basePath)) {
		log.fatal(`Invalid base path: ${composition.basePath}`);
		process.exit();
	}

	// Convert ISO strings to Unix
	for (const item of composition?.items) {
		if (typeof item.startTime === "string") {
			log.fatal(item.startTime);
			item.startTime = Math.floor(Date.parse(item.startTime) / 1000).toString();
		}
		if (typeof item.stopTime === "string") {
			item.stopTime = Math.floor(Date.parse(item.stopTime) / 1000).toString();
		}
	}

	const now = Math.floor(new Date().getTime() / 1000);

	const schema = Joi.object({
		timeType: Joi.string().valid("relative", "real").optional(),
		basePath: Joi.string().optional(),
		filler: Joi.object({
			file: Joi.string().required().custom(checkFile),
			length: Joi.number().integer().positive(),
			countdown: Joi.boolean().optional(),
		}).optional(),
		items: Joi.array().items(
			Joi.object({
				file: Joi.string().required().custom(checkFile),
				start: Joi.number().integer().positive().optional(),
				stop: Joi.number()
					.integer()
					.positive()
					.greater(Joi.ref("start"))
					.optional(),
				startTime: Joi.number().greater(now).optional(),
				endTime: Joi.number().greater(Joi.ref("startTime")).optional(),
			})
				.required()
				.min(1),
		),
	});

	const { error } = schema.validate(composition);

	if (error) {
		log.fatal("Composition file invalid");
		log.fatal(error);
		process.exit();
	}

	log.info("Composition file valid");

	return composition;
}

function checkFile(value) {
	const fullPath = join(composition.basePath, value);
	if (!fs.existsSync(fullPath)) {
		throw new Error(`File not found: ${value}`);
	}
	return true;
}
