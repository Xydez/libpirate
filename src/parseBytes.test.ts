import parseBytes from "./parseBytes";

it("parses different data sizes", () => {
	expect(() => parseBytes("16")).toThrow();
	expect(() => parseBytes("16 iB")).toThrow();

	expect(parseBytes("256 B")).toBe(256);
	expect(parseBytes("256B")).toBe(256);

	expect(parseBytes("16 KB")).toBe(16 * 1000);
	expect(parseBytes("16 KiB")).toBe(16 * 1024);

	expect(parseBytes("16 MB")).toBe(16 * 1000 * 1000);
	expect(parseBytes("16 MiB")).toBe(16 * 1024 * 1024);

	expect(parseBytes("16 GB")).toBe(16 * 1000 * 1000 * 1000);
	expect(parseBytes("16 GiB")).toBe(16 * 1024 * 1024 * 1024);

	expect(parseBytes("16 TB")).toBe(16 * 1000 * 1000 * 1000 * 1000);
	expect(parseBytes("16 TiB")).toBe(16 * 1024 * 1024 * 1024 * 1024);
});
