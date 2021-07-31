import axios, { AxiosInstance } from "axios";
import cheerio from "cheerio";
import { Observable, Subscriber } from "rxjs";
import parseBytes from "../parseBytes";
import Torrent from "../Torrent";
import TorrentProvider, { Search } from "../TorrentProvider";
import parseTorrent from "parse-torrent";

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36';

export default class NyaaSi extends TorrentProvider {
	private http: AxiosInstance;

	constructor() {
		super();
		
		this.http = axios.create({
			baseURL: "https://nyaa.si/",
			headers: { "User-Agent": USER_AGENT }
		});
	}

	public search(search: Search): Observable<Torrent> {
		// /?f=0&c=1_0&q=<query>

		return new Observable(subscriber => {
			const async_fn = async (subscriber: Subscriber<Torrent>) => {
				try {
					let response = await this.http.get(`/?f=0&c=1_0&q=${encodeURIComponent(search.query)}&s=seeders&o=desc`);

					let $ = cheerio.load(response.data);

					const rows = $("tbody tr");

					if (rows.length > 0) {
						rows.each((i, element) => {
							if (i >= search.limit) {
								return;
							}

							// TODO: Get uploader

							// name: td[1] > a[1] .text
							let name = $(element).find("td:nth-of-type(2) a:nth-last-of-type(1)").text();

							// magnet: td[2] > a[1] .href
							let magnet = $(element).find("td:nth-of-type(3) a:nth-of-type(2)").attr("href");

							// size: td[3] .text
							let size = parseBytes($(element).find("td:nth-of-type(4)").text());

							// seeds: td[5] .text
							let seeders = Number.parseInt($(element).find("td:nth-of-type(6)").text());

							// leech: td[6] .text
							let leechers = Number.parseInt($(element).find("td:nth-of-type(7)").text());

							if (magnet == undefined) {
								throw Error("Failed to parse response");
							}
							
							let torrent: Torrent = {
								name, magnet, size, seeders, leechers, hash: parseTorrent(magnet).infoHash!
							};

							subscriber.next(torrent);
						});

						subscriber.complete();
					}
				} catch (error) {
					subscriber.error(error);
				}
			};
	
			async_fn(subscriber);
		});
	}
}
