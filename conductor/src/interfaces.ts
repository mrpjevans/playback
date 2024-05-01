export interface Item {
	file: string;
	start?: number;
	stop?: number;
	startTime?: number | string;
	stopTime?: number | string;
	preRoll?: Item;
	postRoll?: Item;
}

export interface FillerItem {
	file: string;
	length?: number;
	countdown?: boolean;
}

export interface Composition {
	basePath?: string;
	timeType?: "real" | "relative";
	filler?: FillerItem;
	items?: Item[];
}

interface VlcStatusInformationCategory {
	$: {
		name: string;
	};
	info:
		| {
				_: string;
				$: {
					name: string;
				};
		  }
		| {
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
