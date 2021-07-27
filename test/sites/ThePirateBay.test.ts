import ThePirateBay from "../../src/sites/ThePirateBay";

// Increase the jest timeout because we're making a http request
jest.setTimeout(10000);

it("attempts to get 10 torrents from thepiratebay.org", () => new Promise<void>((resolve, reject) =>
{
	let provider = new ThePirateBay();

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
