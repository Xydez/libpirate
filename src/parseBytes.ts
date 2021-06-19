/**
 * Parse a string with a unit into a number of bytes
 * @param str The string to parse
 * @returns The amount of bytes
 */
export default function parseBytes(str: string): number {
	const match = str.match(/(\d+) ?([KMGT]?)(i?)B/);
	if (match == null) {
		throw new Error("Failed to parse bytes");
	}
 
	const amount = parseInt(match[1]);
 
	if (match[3] === "i") {
		switch(match[2]) {
		case "K":	return amount * 1024;
		case "M":	return amount * 1024 * 1024;
		case "G":	return amount * 1024 * 1024 * 1024;
		case "T":	return amount * 1024 * 1024 * 1024 * 1024;
		}
	} else {
		switch(match[2]) {
		case "":	return amount;
		case "K":	return amount * 1000;
		case "M":	return amount * 1000 * 1000;
		case "G":	return amount * 1000 * 1000 * 1000;
		case "T":	return amount * 1000 * 1000 * 1000 * 1000;
		}
	}

	throw new Error("Failed to parse bytes");
}
