import * as fs from "fs";

const defaults = {
	logLevel: "debug",
	logPretty: true,
	port: 3000,
	name: "PlaybackOS",
	vlcURL: "http://127.0.0.1:8080/requests",
	vlcPassword: "playback",
	webUsername: "playback",
	webPassword: "playback",
	mediaDir: `${__dirname}/../media`,
	wifi: {
		wiredDevice: "eth0",
		wifiDevice: "wlan0",
		hotspotName: "playbackOS",
		hotspotSSID: "playbackOS",
		hotspotPassword: "playback",
		dev: process.env.ENVIRONMENT === "dev",
	},
};

const envFile = `${__dirname}/../../env.json`;
export const config = fs.existsSync(envFile)
	? { ...defaults, ...JSON.parse(fs.readFileSync(envFile, "utf-8")) }
	: defaults;
