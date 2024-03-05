import { execSync } from "child_process";

export type NmcliConnection = {
	name: string;
	uuid?: string;
	type?: string;
	device?: string;
	ipv4?: string;
};

export function getConnections(): NmcliConnection[] {
	const output = execSync("nmcli -t c").toString();

	const lines = output.split("\n");
	lines.pop();

	const connections = lines.map((line) => {
		const fields = line.split(":");
		return {
			name: fields[0],
			uuid: fields[1],
			type: fields[2],
			device: fields[3],
			ipv4: "",
		};
	});

	const ips = JSON.parse(execSync("ip -j address show").toString());

	for (const ip of ips) {
		const conn = connections.find(
			(connection) => connection.device === ip.ifname,
		);
		if (conn) {
			const v4 = ip.addr_info.find((addr) => addr.family === "inet");
			conn.ipv4 = v4.local;
		}
	}

	return connections;
}

export function deleteConnection(name: string) {
	execSync(`sudo nmcli con del id ${name}`);
}

export type NmcliWifiConnection = {
	name: string;
	device: string;
	ssid: string;
	password: string;
};

export function createWifiConnection(opts: NmcliWifiConnection) {
	const output = execSync(
		`sudo nmcli con add con-name ${opts.name} ifname ${opts.device} type wifi ssid "${opts.ssid}" && \
		sudo nmcli con modify ${opts.name} wifi-sec.key-mgmt wpa-psk && \
		sudo nmcli con modify ${opts.name} wifi-sec.psk ${opts.password}`,
	).toString();

	if (!output.includes("successfully added")) {
		throw new Error(output);
	}
}

export function startAP(name: string) {
	execSync(
		`sudo nmcli con modify ${name} 802-11-wireless.mode ap 802-11-wireless.band bg ipv4.method shared && sudo nmcli con up ${name}`,
	);
}

type NmcliWifiNetwork = {
	ssid: string;
	signal: number;
	mode: string;
	security: string[];
};

export function scanForWifiNetworks(): NmcliWifiNetwork[] {
	const output = execSync(
		`nmcli -f ssid,signal,mode,security -t dev wifi list --rescan yes`,
	).toString();

	const lines = output.split("\n");
	lines.pop();

	return lines.reduce((acc: NmcliWifiNetwork[], line) => {
		const fields = line.split(":");
		if (
			!acc.find((network) => network.ssid === fields[0]) &&
			fields[0].trim() !== ""
		) {
			acc.push({
				ssid: fields[0],
				signal: parseInt(fields[1]),
				mode: fields[2],
				security: fields[3].split(" "),
			});
		}
		return acc;
	}, []);
}

// Currently nmcli cannot scan for networks when in AP mode
export function scanForWifiNetworksWithIw(device: string): string[] {
	const output = execSync(
		`sudo iw dev ${device} scan ap-force | grep SSID`,
	).toString();

	const lines = output.split("\n");

	return lines.reduce((acc: string[], line) => {
		const fields = line.split(":");
		if (fields.length < 2) return acc;
		const ssid = fields[1].trim();
		if (!acc.find((network) => network === ssid) && ssid !== "") {
			acc.push(ssid);
		}
		return acc;
	}, []);
}

export function connectToWifi(ssid: string, password: string) {
	const output = execSync(
		`sudo nmcli device wifi connect ${ssid} password ${password}`,
	).toString();
	return output;
}
