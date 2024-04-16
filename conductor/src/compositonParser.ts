import * as fs from "fs";
import { join } from "path";

// import { env } from "./env";
import { Composition } from "./interfaces";
import { log } from "./log";

export function getComposition() {
	const filePath = `${__dirname}/composition.json`;

	if (!fs.existsSync(filePath)) {
		log.error(`Composition file not found: ${filePath}`);
		process.exit();
	}

	let composition: Composition;
	try {
		composition = JSON.parse(fs.readFileSync(filePath).toString());
	} catch (err) {
		log.fatal(`Could not parse ${filePath}`);
		log.fatal(`Error: ${err.message}`);
	}

	if (!composition.basePath) {
		composition.basePath = join(__dirname, "..", "media");
		log.info(`Base path set to ${composition.basePath}`);
	}

	return composition;
}
