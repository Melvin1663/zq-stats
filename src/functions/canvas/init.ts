import fs from 'fs';
import { Canvas, FontLibrary, loadImage } from 'skia-canvas';
import client from '../../../index';

export default async () => {
    console.log('Loading canvas images...');

    let bg_dirs = fs.readdirSync('./assets/canvas/bg_png');

    for await (let dir of bg_dirs) {
        let frames = fs.readdirSync(`./assets/canvas/bg_png/${dir}`);

        for await (let frame of frames) {
            client.canvas.imgs[`${dir}_${frame.replace('.png', '')}`] = await loadImage(`./assets/canvas/bg_png/${dir}/${frame}`);
            // console.log(`${dir}_${frame.replace('.png', '')}`);
        }
    }

    console.log('Loaded canvas images');
    
    console.log('Loading canvas fonts...');

    let fonts = fs.readdirSync('./assets/canvas/fonts');

    for (let font of fonts) {
        FontLibrary.use(font.slice(0, -4), [`./assets/canvas/fonts/${font}`]);
        // canvas.registerFont(`./assets/canvas/fonts/${font}`, { family: font.slice(0, -4) });
    }

    console.log('Loaded canvas fonts');
}