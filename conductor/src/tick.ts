import { Composition } from "./interfaces";
import { log } from "./log";
import { callVlc, vlcInfo } from "./vlc";

let lastTimeUnix = 0;
let cursor = 0;

export async function tick(composition: Composition) {
	// This will not be running on a real-time OS, so we run slightly less than
	// one second and to check for underflows
	const thisTime = new Date();
	const thisTimeUnix = Math.floor(thisTime.getTime() / 1000);
	if (thisTimeUnix === lastTimeUnix) return;
	lastTimeUnix = thisTimeUnix;
	log.debug(thisTime.toISOString());

	if (cursor === -1) return;

	const playInfo = await vlcInfo();
	log.debug(playInfo);

	const current = composition.items[cursor];

	// Anything happening?
	if (playInfo.file === "") {
		if (cursor === composition.items.length) {
			log.info("Playback complete");
			cursor = -1;
			return;
		}

		log.debug(`Cursor: ${cursor}`);
		const fullPath = `${composition.basePath}/${current.file}`;
		log.info(`Playing ${cursor}:${fullPath}`);
		await callVlc(`?command=in_play&input=${fullPath}`);

		cursor++;
	}
}
