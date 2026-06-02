import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../../types/types";
import { ApiResponse, PlayerStats } from "../../../types/zeqaTypes";
import { createCanvas } from "canvas";
import GIFEncoder from 'gifencoder';

const ratio = (a: number | undefined, b: number | undefined) => {
  if (b === 0 || b === undefined) return (a ?? 0).toFixed(2);
  return ((a ?? 0) / (b ?? 1)).toFixed(2);
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
  ],
  run: async (int: ChatInputCommandInteraction) => {
    await int.deferReply();

    const width = 200;
    const height = 200;

    const encoder = new GIFEncoder(width, height);

    encoder.start();
    encoder.setRepeat(0); // loooooooooop
    encoder.setDelay(500);
    encoder.setQuality(10);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const colors = ['#FF0000', '#00FF00', '#0000FF'];
    colors.forEach((color) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);

      encoder.addFrame(ctx as any);
    });

    encoder.finish();


    await int.editReply({
      files: [{
        attachment: encoder.out.getData(),
        name: `player.gif`
      }]
    })
  },
};
