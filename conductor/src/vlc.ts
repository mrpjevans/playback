import { parseStringPromise } from "xml2js";

import { env } from "./env";
import { log } from "./log";
import { PlayInfo, VlcStatus } from "./interfaces";

export function vlcStatus() {
	return callVlc();
}

export async function callVlc(url = "") {
	const fullURL = `${env.vlcURL}/status.xml${url}`;

	const response = await fetch(fullURL, {
		headers: {
			Authorization: `Basic ${btoa(`:${env.vlcPassword}`)}`,
		},
	});

	const parsed = await parseStringPromise(await response.text(), {
		explicitArray: false,
	});

	return parsed.root;
}

// VLC's stuff is hard to parse, so this gets the info we need
export async function vlcInfo() {
	const status = (await vlcStatus()) as VlcStatus;
	log.trace(status);

	const playInfo: PlayInfo = {
		length: status.length,
		position: status.time,
		state: status.state,
		file: "",
	};

	if (Array.isArray(status.information.category)) {
		const category = status.information.category.find((category) => {
			return category.$.name === "meta";
		});

		playInfo.file = category.info.find((info) => info.$.name === "filename")._;
	}

	return playInfo;
}
