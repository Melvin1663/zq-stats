export type ApiResponse<T> =
	| { err: null; result: T }
	| { err: string; result?: never };

export type PlayerStats = {
	lifetime: LifetimeStats;
	elo: Record<string, number>;
	season_stats: SeasonStats;
	duel_stats: Record<string, DuelModeStats>;
	ffa_stats: Record<string, FfaModeStats>;
	rankings?: Record<string, number>;
};

export type LifetimeStats = {
	kills: number;
	deaths: number;
	coins: number;
	shards: number;
	bp: number;
};

export type SeasonStats = {
	kills: number;
	deaths: number;
};

export type DuelModeStats = Partial<{
	ranked_wins: number;
	ranked_losses: number;
	unranked_wins: number;
	unranked_losses: number;
	current_winstreak: number;
	highest_winstreak: number;
}>;

export type FfaModeStats = Partial<{
	kills: number;
	deaths: number;
	current_killstreak: number;
	highest_killstreak: number;
}>;

export type LeaderboardEntry<TKey extends string> = {
	username: string;
} & Record<TKey, number>;

export type PlayerCosmetics = {
	xuid: string;
	name: string;
	potcolor: string;
	projectile: string;
	tag: string;
	artifact: string;
	cape: string;
	killphrase: string;
	ownedprojectile: string;
	ownedtag: string;
	ownedartifact: string;
	ownedcape: string;
	ownedkillphrase: string;
	premium_bp: number;
	free_bp_progress: number;
	premium_bp_progress: number;
	login_streak: number;
	mount: string;
	ownedmount: string;
	elitetag: string;
};
