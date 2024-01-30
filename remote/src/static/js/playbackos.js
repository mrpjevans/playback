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
		document.getElementById("currentFile").innerHTML =
			status.information.category[0].info[0]._.split("/").slice(-1);
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

function setPlaylist(file) {
	vlcStatus("pl_empty");
	vlcStatus(`in_play&input=file://${file}`);
}
