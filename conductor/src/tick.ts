import { start } from "repl";
import { Composition, Item } from "./interfaces";
import { log } from "./log";
import { callVlc, vlcInfo } from "./vlc";

let lastTimeUnix = 0;
let cursor = 0;
let firstFlag = true;
let counter = 0;
let waitUntil = 0;

export async function tick(composition: Composition) {
	// This will not be running on a real-time OS, so we run slightly less than
	// one second and to check for underflows
	const thisTime = new Date();
	const thisTimeUnix = Math.floor(thisTime.getTime() / 1000);
	if (thisTimeUnix === lastTimeUnix) return;
	lastTimeUnix = thisTimeUnix;
	log.debug(`${thisTime.toISOString()} Tick: ${counter}`);
	counter++;

	if (cursor === -1) return;

	const playInfo = await vlcInfo();
	log.debug(playInfo);

	if (firstFlag) {
		await playFile(composition);
		firstFlag = false;
		return;
	}

	if (playInfo.state === "stopped") {

		if (waitUntil === 0) {

			cursor++;

			if (cursor === composition.items.length) {
				log.info("Playback complete");
				cursor = -1;
				return;
			}

			const current = composition.items[cursor];
			waitUntil = current.startTime ?? 0;
			if (waitUntil > 0) {
				log.info(`Waiting until tick ${current.startTime}`)
			}

		}

		if (waitUntil === 0 || counter >= waitUntil) {
			await playFile(composition);
			waitUntil = 0;
		}

	}

	const current = composition.items[cursor];

	if (playInfo.state == 'playing') {

		log.trace("Playing");

		if (current.stopTime && current.stopTime <= counter) {
			log.info(`Stopping playback at ${current.stopTime}s`);
			await callVlc(`?command=pl_stop`);
		}

	}

	if (current.stop && playInfo.position >= current.stop) {
		log.info(`Stopping playback at ${current.stop}s`);
		await callVlc(`?command=pl_stop`);
		return;
	}

}

async function playFile(composition: Composition) {
	const item = composition.items[cursor];
	log.debug(`Cursor: ${cursor}`);
	const fullPath = `${composition.basePath}/${item.file}`;
	log.info(`Playing ${cursor}:${fullPath}`);
	await callVlc(`?command=in_play&input=${fullPath}`);

	if (item.start) {
		log.debug(`Starting playback at ${item.start}s`);
		await callVlc(`?command=seek&val=${item.start}`);
	}

}