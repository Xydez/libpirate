import { Observable } from "rxjs";

import Torrent from "./Torrent";

export interface Search {
	query: string;
	limit: number;
}

export default abstract class TorrentProvider {
	public abstract search(search: Search): Observable<Torrent>;
}
