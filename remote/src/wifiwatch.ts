import { pino } from "pino";

import { config } from "./config";
import {
	getConnections,
	createWifiConnection,
	NmcliConnection,
	startAP,
} from "./lib/nmcli";

const log = pino({
	...(config.logPretty && {
		transport: {
			target: "pino-pretty",
		},
	}),
	...(config.logLevel && {
		level: config.logLevel,
	}),
});

type ConnectionStatus = {
	connections: NmcliConnection[];
	wired: boolean;
	wifi: NmcliConnection | boolean;
	hotspotActive: boolean;
	hotspotExists: boolean;
};

function getConnectionStatus(): ConnectionStatus {
	log.info("Requesting current network connections");
	const connections = getConnections();

	return {
		connections,
		wired: connections.some(
			(connection) => connection.device === config.wiredDevice,
		),
		wifi:
			connections.find(
				(connection) => connection.device === config.wifiDevice,
			) || false,
		hotspotActive: connections.some(
			(connection) =>
				connection.name === config.hotspotName &&
				connection.device === config.wifiDevice,
		),
		hotspotExists: connections.some(
			(connection) => connection.name === config.hotspotName,
		),
	};
}

// Start
try {
	const connections = getConnectionStatus();

	if (!connections.hotspotExists) {
		log.info(`Hotspot '${config.hotspotName}' not found, creating...`);
		createWifiConnection({
			name: config.hotspotName,
			device: config.wifiDevice,
			ssid: config.hotspotSSID,
			password: config.hotspotPassword,
		});
		log.info(`Hotspot '${config.hotspotName}' created`);
	} else {
		log.debug(`Hotspot '${config.hotspotName}' found`);
	}

	if (!connections.wifi) {
		log.info(`No wifi connection, starting hotspot '${config.hotspotName}'`);
		startAP(config.hotspotName);
	} else if (connections.hotspotActive) {
		log.info(`Hotspot '${config.hotspotName}' active`);
	} else {
		log.info(
			`Wifi connected to '${(connections.wifi as NmcliConnection).name}'`,
		);
	}
} catch (err) {
	log.error(err.message);
	process.exit(1);
}
