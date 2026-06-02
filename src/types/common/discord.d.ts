import { Image } from "skia-canvas";

declare module "discord.js" {
    export interface Client {
        interactionsCache: {
            [key: string]: BaseInteraction;
        };
        canvas: {
            imgs: {
                [key: string]: Image;
            },
            fonts: {
                [key: string]: CanvasFont
            }
        }
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