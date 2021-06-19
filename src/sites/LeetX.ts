import axios, { AxiosInstance } from "axios";
import cheerio from "cheerio";
import { Observable, Subscriber } from "rxjs";
import parseBytes from "../parseBytes";
import Torrent from "../Torrent";
import TorrentProvider, { Search } from "../TorrentProvider";

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36';

export default class LeetX extends TorrentProvider {
	private http: AxiosInstance;

	constructor() {
		super();

		this.http = axios.create({
			baseURL: "http://1337x.to/",
			headers: { "User-Agent": USER_AGENT }
		});
	}

	public search(search: Search): Observable<Torrent> {
		return new Observable(subscriber => {
			const async_fn = async (subscriber: Subscriber<Torrent>) => {
				let start_count = 0;
				let done_count = 0;

				for (let page = 1; start_count < search.limit; page++) {
					try {
						let response = await this.http.get(`/search/${encodeURIComponent(search.query)}/${page}/`);

						let $ = cheerio.load(response.data);

						const rows = $(".table-list tbody tr");
						
						if (rows.length > 0) {
							rows.each(async (_, element) => {
								try {
									// Only get up to the limit
									if (start_count >= search.limit) {
										return;
									}

									start_count += 1;

									// Get info about the torrent
									let name = $(element).find(".name a:nth-of-type(2)").text();
									let seeders = Number.parseInt($(element).find("td.seeds").text());
									let leechers = Number.parseInt($(element).find("td.leeches").text());
									let link = $(element).find(".name a:nth-of-type(2)").attr("href");
									let size = parseBytes($(element).find(".size").text());
									let uploader = $(element).find(".vip a").text() || $(element).find(".uploader a").text();
								
									if (name === undefined ||
										seeders === undefined ||
										leechers === undefined ||
										link === undefined ||
										size === undefined ||
										uploader === undefined) {
										throw new Error("Search failed during page scraping.");
									}

									let response = await this.http.get(link!);

									$ = cheerio.load(response.data);

									let magnet = $('[href^="magnet:"]').attr('href');
                					let hash = $('.infohash-box span').text();

                					if (magnet === undefined || hash === undefined) {
										throw new Error("Search failed during page scraping.");
                					}

									let torrent: Torrent = {
										name, hash, size, uploader, seeders, leechers, magnet
									};

									subscriber.next(torrent);
									done_count += 1;

									if (done_count == search.limit) {
										subscriber.complete();
									}
								} catch (error) {
									done_count += 1;
									subscriber.error(error);
								}
							});
						} else {
							subscriber.complete();
							break;
						}
					} catch (error) {
						subscriber.error(error);
					}
				}
			};

			async_fn(subscriber);
		});
	}
}
