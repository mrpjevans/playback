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
	const url = command === "" ? "/vlc" : `/vlc?command=${command}`;
	const statusPayload = await (await fetch(url)).json();
	const status = statusPayload.root;

	document.dispatchEvent(new CustomEvent("vlc_status", { detail: status }));

	if (status.volume != lastStatus.volume) {
		document.getElementById("volumeStatus").innerHTML = status.volume;
	}

	if (lastStatus.information) {
		if (!status.information.category[0]) {
			return;
		}

		const filename = status.information.category[0].info[0]
			? status.information.category[0].info[0]._
			: status.information.category[0].info._;
		document.getElementById("currentFile").innerHTML = filename
			.split("/")
			.slice(-1);
	}

	if (status.state !== lastStatus.state) {
		document.getElementById("playStatus").innerHTML =
			status.state === "playing" ? "Playing" : "Paused";
	}

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
