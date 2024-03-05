/* eslint-disable @typescript-eslint/no-unused-vars */
let lastStatus = {};
let lastVolume = 0;

window.onload = () => {
	vlcStatus();
	setInterval(() => {
		vlcStatus();
	}, 1000);
};

async function vlcStatus(command = "") {
	if (
		(command.startsWith("volume&val=+") && lastStatus.volume >= 500) ||
		(command.startsWith("volume&val=-") && lastStatus.volume <= 0)
	) {
		return;
	}

	const url = command === "" ? "/vlc" : `/vlc?command=${command}`;
	const statusPayload = await (await fetch(url)).json();
	const status = statusPayload.root;

	document.dispatchEvent(new CustomEvent("vlc_status", { detail: status }));

	if (status.volume != lastStatus.volume) {
		const volpc = Math.round((status.volume / 500) * 100);
		document.getElementById("volumeStatus").innerHTML = volpc;
	}

	if (!status.information.category[0]) {
		return;
	}

	const meta = status.information.category.find(
		(category) => category.$ === "meta",
	);
	const filenameObj = meta.info.find((info) => info.$.name === "filename");
	const filename = filenameObj._;

	document.getElementById("currentFile").innerHTML = filename
		.split("/")
		.slice(-1);

	const time = new Date(status.time * 1000).toISOString().slice(11, 19);
	const length = new Date(status.length * 1000).toISOString().slice(11, 19);

	document.getElementById("playStatus").innerHTML = `${time} / ${length}`;

	lastStatus = status;
}

function muteToggle() {
	if (lastStatus.volume === "0") {
		vlcStatus(`volume&val=${lastVolume}`);
	} else {
		lastVolume = lastStatus.volume;
		vlcStatus("volume&val=0");
	}
}

function confirmPlaylist(file, name) {
	document
		.getElementById("confirm-playlist-change")
		.setAttribute("data-absfile", file);
	document.getElementById("confirm-playlist-change-file").innerHTML = name;
	new bootstrap.Modal("#confirm-playlist-change").show();
}

async function setPlaylist(startPlayback) {
	const file = document
		.getElementById("confirm-playlist-change")
		.getAttribute("data-absfile");

	await vlcStatus("pl_empty");
	if (!startPlayback) {
		await vlcStatus(`in_enqueue&input=file://${file}`);
	} else {
		await vlcStatus(`in_play&input=file://${file}`);
	}

	window.location = "/";
}
