import axios, { AxiosInstance } from "axios";
import cheerio from "cheerio";
import { Observable, Subscriber } from "rxjs";
import parseBytes from "../parseBytes";
import Torrent from "../Torrent";
import TorrentProvider, { Search } from "../TorrentProvider";

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36';
const TRACKERS = [
	"udp://tracker.coppersurfer.tk:6969/announce",
	"udp://tracker.openbittorrent.com:6969/announce",
	"udp://tracker.opentrackr.org:1337",
	"udp://tracker.leechers-paradise.org:6969/announce",
	"udp://tracker.dler.org:6969/announce",
	"udp://opentracker.i2p.rocks:6969/announce",
	"udp://47.ip-51-68-199.eu:6969/announce"
];

/*
{
	"id":"12678054",
	"name":"Rick and Morty Season 2 [WEBRIP] [1080p] [HEVC]",
	"info_hash":"0494A80532B5B05DDE567C61220D93406B7E22E7",
	"leechers":"54",
	"seeders":"124",
	"num_files":"19",
	"size":"2399284168",
	"username":".BONE.",
	"added":"1446523607",
	"status":"vip",
	"category":"208",
	"imdb":"tt2861424"
}
*/

type ApiBayResponse = {
	id: string,
	name: string,
	info_hash: string,
	leechers: string,
	seeders: string,
	num_files: string,
	size: string,
	username: string,
	added: string,
	status: string,
	category: string,
	imdb: string
}[];

function generate_magnet(name: string, info_hash: string) {
	return `magnet:?xt=urn:btih:${info_hash}&dn=${encodeURIComponent(name)}&tr=${TRACKERS.map(tr => encodeURIComponent(tr)).join("&tr=")}`;
}

export default class ThePirateBay extends TorrentProvider {
	private http: AxiosInstance;

	constructor() {
		super();

		this.http = axios.create({
			baseURL: "http://thepiratebay.org/",
			headers: { "User-Agent": USER_AGENT }
		});
	}

	public search(search: Search): Observable<Torrent> {
		return new Observable(subscriber => {
			const async_fn = async (subscriber: Subscriber<Torrent>) => {
				/* TODO: Write code here */
				// https://thepiratebay.org/search.php?q=Rick+and+morty
				try {
					let response = await this.http.get<ApiBayResponse>(`http://apibay.org/q.php?q=${encodeURIComponent(search.query)}`);

					let count = 0;
					for (const el of response.data)
					{
						let torrent: Torrent = {
							name: el.name,
							hash: el.info_hash,
							size: Number.parseInt(el.size),
							uploader: el.username,
							seeders: Number.parseInt(el.seeders),
							leechers: Number.parseInt(el.leechers),
							magnet: generate_magnet(el.name, el.info_hash)
						};

						subscriber.next(torrent);
						count += 1;

						if (count >= search.limit) {
							break;
						}
					}

					subscriber.complete();
				} catch (error) {
					subscriber.error(error);
				}
			};

			async_fn(subscriber);
		});
	}
}
