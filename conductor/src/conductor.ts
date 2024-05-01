import * as commandLineArgs from "command-line-args";
import { log } from "./log";
import { tick } from "./tick";
import { getComposition } from "./compositionParser";
import { callVlc } from "./vlc";

const optionsDefinitions = [
	{
		name: "config",
		alias: "c",
		type: String,
		description: "Path to composition file",
	},
];

const options = commandLineArgs(optionsDefinitions);

const composition = getComposition(options?.config);

log.info("Clearing playlist");
(async () => {
	await callVlc(`?command=pl_stop`);
	await callVlc(`?command=pl_empty`);
})();

log.info("Starting loop");

setInterval(async () => {
	await tick(composition);
}, 990);
