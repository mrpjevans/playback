import * as fs from "fs";

const defaults = {
	logLevel: "debug",
	logPretty: true,
	port: 3000,
	name: "PlaybackOS",
	vlcURL: "http://127.0.0.1:8080/requests",
	mediaDir: `${__dirname}/../../media`
};

const envFile = `${__dirname}/../../env.json`;
export const config = fs.existsSync(envFile)
	? { ...defaults, ...JSON.parse(fs.readFileSync(envFile, "utf-8")) }
	: defaults;
