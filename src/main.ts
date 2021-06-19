import LeetX from "./sites/LeetX";

let provider = new LeetX();

let counter = 0;

provider.search({ query: "Rick and morty", limit: 10 })
	.subscribe({
		next: torrent => {
			counter += 1;
			console.log(`${counter}.\t${torrent.name}`);
		},
		error: console.error,
		complete: () => console.log(`Search yielded ${counter} results`)
	});
