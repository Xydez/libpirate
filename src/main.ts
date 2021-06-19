import ThePirateBay from "./sites/ThePirateBay";
import { merge } from "rxjs";
import { toArray, map, retry } from "rxjs/operators";
import { Search } from "./TorrentProvider";
import LeetX from "./sites/LeetX";

const thepiratebay = new ThePirateBay();
const leetx = new LeetX();

let counter = 0;

const search: Search = {
	query: "Rick and morty",
	limit: 100
};

function min(a: number, b: number): number {
	return a < b ? a : b;
}

merge(thepiratebay.search(search), leetx.search(search))
	.pipe(retry(2), toArray(), map(torrents => torrents.sort((a, b) => b.seeders - a.seeders)))
	.subscribe(torrents => {
		for (let i = 0; i < min(torrents.length, 10); i++) {
			const torrent = torrents[i];

			console.log(`${i + 1}.\t${torrent.name} (${torrent.seeders})`);
		}
	});

	// () => console.log(`Search yielded ${counter} results`)