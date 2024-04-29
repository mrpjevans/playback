import * as fs from "fs";

export const defaults = {
	logLevel: "debug",
	vlcURL: "http://127.0.0.1:8080/requests",
	vlcPassword: "playback",
};

const envFile = `${__dirname}/../../env.json`;
export const env = fs.existsSync(envFile)
	? { ...defaults, ...JSON.parse(fs.readFileSync(envFile, "utf-8")) }
	: defaults;
