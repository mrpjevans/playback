import { log } from "./log";
import { tick } from "./tick";
import { getComposition } from "./compositonParser";
import { callVlc } from "./vlc";

const composition = getComposition();

log.info("Clearing playlist");
(async () => {
	await callVlc(`?command=pl_empty`);
})();

log.info("Starting loop");

setInterval(async () => {
	await tick(composition);
}, 990);
