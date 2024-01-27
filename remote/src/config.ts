import * as fs from "fs";

const defaults = {
	logLevel: "debug",
	logPretty: true,
	port: 3000,
	name: "PlaybackOS",
};

const envFile = `${__dirname}/../env.json`;
export const config = fs.existsSync(envFile)
	? { ...defaults, ...JSON.parse(fs.readFileSync(envFile, "utf-8")) }
	: defaults;