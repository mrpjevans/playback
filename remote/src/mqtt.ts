import { pino } from "pino";
import * as mqtt from "mqtt";

import { callVLC } from "./lib/vlc";
import { config } from "./config";

const logger = pino({
	level: config.logLevel,
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
		},
	},
});

logger.info("Connecting to MQTT broker");

const client = mqtt.connect(config.mqttBroker, {
	clientId: config.mqttClientId,
	...(config.mqttUsername && { username: config.mqttUsername }),
	...(config.mqttPassword && { username: config.mqttPassword }),
});

logger.info("Starting MQTT relay");

setInterval(async () => {
	logger.info("Running");
	try {
		logger.debug("Calling VLC");
		const status = await callVLC();
		logger.trace(status);

		const parsedStatus = parseVlcStatus(status);
		logger.debug("Publishing to MQTT");
		client.publish(config.mqttTopic, JSON.stringify(parsedStatus));

		logger.debug("Success");
	} catch (err) {
		logger.fatal("Error calling VLC or publishing");
		logger.fatal(err);
	}
}, config.mqttInterval);

interface IVLCStatus {
	state: string;
	volpc: number;
	filename?: string;
	timeStr?: string;
	lengthStr?: string;
	raw: unknown;
}

function parseVlcStatus(rawStatus): IVLCStatus {
	const volpc = Math.round((rawStatus.root.volume / 500) * 100);

	if (!rawStatus.root.information.category[0]) {
		return {
			state: rawStatus.root.state,
			volpc,
			raw: rawStatus,
		};
	}

	const meta = rawStatus.root.information.category.find(
		(category) => category.$.name === "meta",
	);

	const filename = meta.info._
		? meta.info._
		: meta.info.find((info) => info.$.name === "filename")._;

	const timeStr = new Date(rawStatus.root.time * 1000)
		.toISOString()
		.slice(11, 19);
	const lengthStr = new Date(rawStatus.root.length * 1000)
		.toISOString()
		.slice(11, 19);

	return {
		state: rawStatus.root.state,
		volpc,
		filename,
		timeStr,
		lengthStr,
		raw: rawStatus,
	};
}
