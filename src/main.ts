import { ThePirateBay, LeetX } from "./sites";
import { merge } from "rxjs";
import { toArray, map, retry } from "rxjs/operators";
import { Search } from "./TorrentProvider";
import { Command } from "commander";

const program = new Command();
program.name("libpirate");
program.version("1.0.0");

function min(a: number, b: number): number {
	return a < b ? a : b;
}

function strtrunc(string: string, length: number, align: number = -1): string {
	if (string.length > length) {
		return string.substring(0, length - 3) + "...";
	} else {
		if (align < 0) {
			return string + " ".repeat(length - string.length);
		} else if (align > 0) {
			return " ".repeat(length - string.length) + string;
		} else {
			return " ".repeat(Math.ceil((length - string.length) / 2)) + string + " ".repeat(Math.floor((length - string.length) / 2));
		}
	}
}

const sites = [
	new ThePirateBay(),
	new LeetX()
];

program
	.argument("<query>", "Query to search for")
	.option("-m, --show-magnet", "Display the magnet link for each torrent")
	.option("-q, --quiet", "Don't output anything except the search results")
	.option("-l, --limit <limit>", "Limit the amount of results", "10")
	.option("-s, --min-seeders <seeders>", "Only show torrents with a minimum amount of seeders")
	.action(query => {
		const opts = program.opts<{ showMagnet: boolean, quiet: boolean, limit: number, minSeeders?: number }>();
		const search: Search = { query, limit: opts.limit };

		if (!opts.quiet) {
			console.log(`Searching for "${query}"`);
		}
		
		merge(...sites.map(site => site.search(search)))
			.pipe(retry(2), toArray(), map(torrents => torrents.sort((a, b) => b.seeders - a.seeders)))
			.subscribe(torrents => {

				for (let i = 0; i < min(torrents.length, opts.limit); i++) {
					const torrent = torrents[i];

					if (opts.minSeeders !== undefined && torrent.seeders < opts.minSeeders) {
						break;
					}
		
					// 80 - 14
					console.log(`${strtrunc((i + 1).toString() + ".", 5)} ${strtrunc(torrent.name, 80 - 15)} ${strtrunc("(" + torrent.seeders.toString() + ")", 8, 1)}`);
				
					if (opts.showMagnet === true) {
						// strtrunc(torrent.magnet, 80 - 4)
						console.log(` -> ${torrent.magnet}\n`);
					}
				}
			});
	});

program.parse(process.argv);
