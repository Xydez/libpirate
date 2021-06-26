import LeetX from "./LeetX";

// Increase the jest timeout because we're making a http request
jest.setTimeout(10000);

it("attempts to get 10 torrents from 1337x.to", () => new Promise<void>((resolve, reject) => {
	let provider = new LeetX();

	let counter = 0;
	provider.search({ query: "Rick and morty", limit: 10 })
		.subscribe({
			next: _ => counter++,
			error: () => reject(),
			complete: () => {
				expect(counter).toBe(10);
				resolve();
			}
		});
}));
