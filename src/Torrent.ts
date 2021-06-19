export default interface Torrent {
	name: string;
	hash: string;
	size: number;
	uploader: string;
	seeders: number;
	leechers: number;
	magnet: string;
}
