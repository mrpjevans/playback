import { parseStringPromise } from "xml2js";

import { config } from "../config";

export async function callVLC(url = "") {
	const fullURL = `${config.vlcURL}/status.xml${url}`;

	const response = await fetch(fullURL, {
		headers: {
			Authorization: `Basic ${btoa(`:${config.vlcPassword}`)}`,
		},
	});

	return await parseStringPromise(await response.text(), {
		explicitArray: false,
	});
}
