export interface Item {
	file: string;
	start?: number;
	stop?: number;
}

export interface Composition {
	basePath?: string;
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
