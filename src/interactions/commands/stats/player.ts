import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../../types/types";
import { ApiResponse, PlayerStats } from "../../../types/zeqaTypes";
import { Canvas, loadImage } from "skia-canvas";
import client from '../../../../index';
import drawMinecraftText from "../../../functions/canvas/mcmd";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";

const width = 1280;
const height = 720;
const sourceFrameCount = 60;
const sourceFrameRate = 30;
const frameRate = 60;
const avifQuality = 70;
const useGpu = true;

const formatSize = (bytes: number) => `${Math.round(bytes / 1024)} KB`;
const formatTime = (milliseconds: number) => `${(milliseconds / 1000).toFixed(2)}s`;
const formatRatio = (a: number, b: number) => b === 0 ? a.toFixed(2) : (a / b).toFixed(2);

const fetchPlayerStats = async (username: string) => {
    const response = await fetch(`https://app.zeqa.net/api/player/stats/name/${encodeURIComponent(username)}`);

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Zeqa API returned error: ${response.status}.`);
    }

    const data = await response.json() as ApiResponse<PlayerStats>;

    if (data.err !== null) {
        throw new Error(`Zeqa API error: ${data.err}.`);
    }

    return data.result;
};

const encodeAvif = (frames: Buffer[]) => {
    const crf = Math.round((100 - avifQuality) * 63 / 100);
    const cq = Math.round((100 - avifQuality) * 51 / 100);
    const outputPath = join(tmpdir(), `player-${randomUUID()}.avif`);
    const encoderArgs = useGpu
        ? [
            "-c:v", "av1_nvenc",
            "-preset", "p5",
            "-cq", cq.toString(),
            "-b:v", "0",
        ]
        : [
            "-c:v", "libaom-av1",
            "-crf", crf.toString(),
            "-b:v", "0",
            "-cpu-used", "4",
        ];

    return new Promise<Buffer>((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
            "-hide_banner",
            "-loglevel", "error",
            "-framerate", sourceFrameRate.toString(),
            "-f", "rawvideo",
            "-pix_fmt", "rgba",
            "-s:v", `${width}x${height}`,
            "-i", "pipe:0",
            "-vf", `fps=${frameRate}`,
            ...encoderArgs,
            "-pix_fmt", "yuv420p",
            "-still-picture", "0",
            "-f", "avif",
            outputPath
        ]);

        const errors: Buffer[] = [];

        ffmpeg.stderr.on("data", chunk => errors.push(chunk));
        ffmpeg.on("error", reject);
        ffmpeg.on("close", async code => {
            if (code === 0) {
                try {
                    const attachment = await fs.readFile(outputPath);
                    await fs.unlink(outputPath);
                    resolve(attachment);
                } catch (error) {
                    reject(error);
                }

                return;
            }

            await fs.unlink(outputPath).catch(() => undefined);
            reject(new Error(Buffer.concat(errors).toString() || `ffmpeg exited with code ${code}`));
        });

        ffmpeg.stdin.end(Buffer.concat(frames));
    });
};

export default <Command>{
    name: "player",
    category: "stats",
    description: "Shows a player's Zeqa stats",
    options: [
        {
            name: "username",
            description: "The player's username",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "theme",
            description: "BG for the image",
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: 'Sunrise', value: 'sunrise' },
                { name: 'Noon', value: 'noon' },
                { name: 'Sunset', value: 'sunset' },
                { name: 'Night', value: 'night' },
                { name: 'Midnight', value: 'midnight' }
            ],
            required: true
        }
    ],
    run: async (int: ChatInputCommandInteraction) => {
        await int.deferReply();

        const canvas = new Canvas(width, height);
        const ctx = canvas.getContext('2d');

        const username = int.options.getString("username", true);
        const theme = int.options.getString("theme", true);

        const zeqaStart = performance.now();
        const playerStats = await fetchPlayerStats(username);
        const zeqaElapsed = performance.now() - zeqaStart;

        if (!playerStats) {
            await int.editReply(`Player \`${username}\` not found.`);
            return;
        }

        const head = await loadImage(`https://inpvp.net/api/skin/${encodeURIComponent(username)}`);
        const frames: Buffer[] = [];

        const canvasStart = performance.now();
        for (let i = 1; i <= sourceFrameCount; i++) {
            ctx.drawImage(client.canvas.imgs[`${theme}_${i}`], 0, 0);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(head, 20, 20, 100, 100);
            ctx.imageSmoothingEnabled = true;

            drawMinecraftText(`§f${username}`, ctx, 140, 54, "minecraft-ten", 36);
            drawMinecraftText(`§7Kills: §a${playerStats.lifetime.kills}`, ctx, 140, 104, "minecraft-seven", 26);
            drawMinecraftText(`§7Deaths: §c${playerStats.lifetime.deaths}`, ctx, 140, 138, "minecraft-seven", 26);
            drawMinecraftText(
                `§7K/D: §e${formatRatio(playerStats.lifetime.kills, playerStats.lifetime.deaths)}`,
                ctx,
                140,
                172,
                "minecraft-seven",
                26,
            );
            drawMinecraftText(`§7Coins: §6${playerStats.lifetime.coins}`, ctx, 140, 206, "minecraft-seven", 26);

            frames.push(await canvas.toBuffer("raw", { colorType: "rgba" }));
        }
        const canvasElapsed = performance.now() - canvasStart;

        const encodeStart = performance.now();
        const attachment = await encodeAvif(frames);
        const encodeElapsed = performance.now() - encodeStart;
        console.log(`AVIF Size: ${(attachment.length / 1024) / 1024}mb`);

        await int.editReply({
            content: `Size: \`${formatSize(attachment.length)}\`\nZeqa API: \`${formatTime(zeqaElapsed)}\`\nCanvas: \`${formatTime(canvasElapsed)}\`\nEncoding: \`${formatTime(encodeElapsed)}\``,
            files: [{
                attachment,
                name: `player.avif`
            }]
        })
    },
};
