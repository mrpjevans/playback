export interface Item {
	file: string;
	start?: number;
	stop?: number;
	startTime?: number;
	stopTime?: number;
}

export interface Composition {
	basePath?: string;
	timeType?: "real" | "relative";
	items?: Item[];
}

interface VlcStatusInformationCategory {
	$: {
		name: string;
	};
	info: {
		_: string;
		$: {
			name: string;
		};
	}[];
}

interface VlcStatusInformation {
	category: VlcStatusInformationCategory[] | VlcStatusInformationCategory;
}

export interface VlcStatus {
	length: number;
	time: number;
	state: string;
	information: VlcStatusInformation;
}

export interface PlayInfo {
	length: number;
	position: number;
	file: string;
	state: string;
}
