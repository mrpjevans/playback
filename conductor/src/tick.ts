import { Composition } from "./interfaces";
import { log } from "./log";
import { callVlc, vlcInfo } from "./vlc";

let lastTimeUnix = 0;
let cursor = 0;
let firstFlag = true;
let counter = 0;
let waitUntil = 0;
let filling = false;

export async function tick(composition: Composition) {
	// This will not be running on a real-time OS, so we run slightly less than
	// one second and to check for underflows
	const thisTime = new Date();
	const thisTimeUnix = Math.floor(thisTime.getTime() / 1000);
	if (thisTimeUnix === lastTimeUnix) return;
	lastTimeUnix = thisTimeUnix;
	if (firstFlag && composition?.timeType === "real") {
		counter = Math.floor(new Date().getTime() / 1000) - 1;
	}
	log.debug(`${thisTime.toISOString()} Tick: ${counter}`);
	counter++;

	const playInfo = await vlcInfo();
	log.debug(playInfo);

	if (playInfo.state === "stopped") {
		if (waitUntil === 0) {
			if (!firstFlag) {
				cursor++;
			} else {
				firstFlag = false;
			}

			if (cursor === composition.items.length) {
				log.info("Playback complete");
				process.exit();
			}

			const current = composition.items[cursor];
			waitUntil = (current.startTime as number) ?? 0;
			if (waitUntil > 0) {
				log.info(`Waiting until tick ${current.startTime}`);
			}
		}

		if (waitUntil === 0 || counter >= waitUntil) {
			filling = false;
			await playFile(composition);
			waitUntil = 0;
			return;
		}

		// Play filler countdown
		if (waitUntil > 0 && composition.filler && !filling) {
			log.info(`Filling time with ${composition.filler.file}`);
			await callVlc(
				`?command=in_play&input=${composition.basePath}/${composition.filler.file}`,
			);
			if (composition.filler.countdown) {
				const startTime = composition.filler.length - (waitUntil - counter);
				log.debug(`Playing countdown for ${waitUntil - counter}s`);
				await callVlc(`?command=seek&val=${startTime}`);
			}
			filling = true;
		}
	}

	const current = composition.items[cursor];

	if (playInfo.state == "playing") {
		log.trace("Playing");

		if (current.stopTime && (current.stopTime as number) <= counter) {
			log.info(`Stopping playback at ${current.stopTime}s`);
			await callVlc(`?command=pl_stop`);
		}
	}

	if (current.stop && playInfo.position >= current.stop) {
		log.info(`Stopping playback at ${current.stop}s`);
		await callVlc(`?command=pl_stop`);
		return;
	}

	if (waitUntil > 0 && filling && counter >= waitUntil) {
		await callVlc(`?command=pl_stop`);
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
