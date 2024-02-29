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
			(connection) => connection.device === config.wifi.wiredDevice,
		),
		wifi:
			connections.find(
				(connection) => connection.device === config.wifi.wifiDevice,
			) || false,
		hotspotActive: connections.some(
			(connection) =>
				connection.name === config.wifi.hotspotName &&
				connection.device === config.wifi.wifiDevice,
		),
		hotspotExists: connections.some(
			(connection) => connection.name === config.wifi.hotspotName,
		),
	};
}

// Start
try {
	const connections = getConnectionStatus();

	if (!connections.hotspotExists) {
		log.info(`Hotspot '${config.wifi.hotspotName}' not found, creating...`);
		createWifiConnection({
			name: config.wifi.hotspotName,
			device: config.wifi.wifiDevice,
			ssid: config.wifi.hotspotSSID,
			password: config.wifi.hotspotPassword,
		});
		log.info(`Hotspot '${config.wifi.hotspotName}' created`);
	} else {
		log.debug(`Hotspot '${config.wifi.hotspotName}' found`);
	}

	if (!connections.wifi) {
		log.info(
			`No wifi connection, starting hotspot '${config.wifi.hotspotName}'`,
		);
		startAP(config.wifi.hotspotName);
	} else if (connections.hotspotActive) {
		log.info(`Hotspot '${config.wifi.hotspotName}' active`);
	} else {
		log.info(
			`Wifi connected to '${(connections.wifi as NmcliConnection).name}'`,
		);
	}
} catch (err) {
	log.error(err.message);
	process.exit(1);
}
