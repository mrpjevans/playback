import * as fs from "fs";

const defaults = {
	logLevel: "debug",
	logPretty: true,
	port: 3000,
	name: "Playback",
	vlcURL: "http://127.0.0.1:8080/requests",
	vlcPassword: "playback",
	webUsername: "playback",
	webPassword: "playback",
	mediaDir: `${__dirname}/../media`,
	wiredDevice: "eth0",
	wifiDevice: "wlan0",
	hotspotName: "playback",
	hotspotSSID: "playback",
	hotspotPassword: "playback",
	dev: process.env.ENVIRONMENT === "dev",
	mqttBroker: "mqtt://192.168.1.10",
	mqttClientId: "playback",
	mqttTopic: "playback/vlc",
	mqttInterval: 5000,
	mqttScreenshot: false,
	mqttScreenshotTopic: "playback/screenshot",
	mqttScreenshotInterval: 0,
};

const envFile = `${__dirname}/env.json`;
export const config = fs.existsSync(envFile)
	? { ...defaults, ...JSON.parse(fs.readFileSync(envFile, "utf-8")) }
	: defaults;
