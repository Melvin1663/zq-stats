declare module "discord.js" {
    export interface Client {
        interactionsCache: {
            [key: string]: BaseInteraction;
        };

        interactions: {
            commands: object;
            context: {
                user: object;
                message: object;
            };
        };
        buttonExpires: number;
        toggles: any;
    }
}

export { };