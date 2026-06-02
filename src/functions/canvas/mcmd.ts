import type { CanvasRenderingContext2D } from "skia-canvas";

type ColorCode =
    | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
    | "a" | "b" | "c" | "d" | "e" | "f" | "g";

type StyleCode = "k" | "l" | "m" | "n" | "o";
type ResetCode = "r";
type FormatCode = ColorCode | StyleCode | ResetCode;

type ColorName =
    | "Black"
    | "Dark Blue"
    | "Dark Green"
    | "Dark Aqua"
    | "Dark Red"
    | "Dark Purple"
    | "Gold"
    | "Gray"
    | "Dark Gray"
    | "Blue"
    | "Green"
    | "Aqua"
    | "Red"
    | "Light Purple"
    | "Yellow"
    | "White"
    | "Minecoin Gold";

type StyleName = "Obfuscated" | "Bold" | "Strikethrough" | "Underline" | "Italic";
type FormatName = ColorName | StyleName | "Reset";

type McmdState = {
    color: ColorName;
    format: StyleName[];
};

type McmdResult = {
    width: number;
};

const formats: Record<FormatCode, FormatName> = {
    "0": "Black",
    "1": "Dark Blue",
    "2": "Dark Green",
    "3": "Dark Aqua",
    "4": "Dark Red",
    "5": "Dark Purple",
    "6": "Gold",
    "7": "Gray",
    "8": "Dark Gray",
    "9": "Blue",
    a: "Green",
    b: "Aqua",
    c: "Red",
    d: "Light Purple",
    e: "Yellow",
    f: "White",
    g: "Minecoin Gold",
    k: "Obfuscated",
    l: "Bold",
    m: "Strikethrough",
    n: "Underline",
    o: "Italic",
    r: "Reset",
};

const colorHex: Record<ColorName, string> = {
    "Black": "#000000",
    "Dark Blue": "#0000AA",
    "Dark Green": "#00AA00",
    "Dark Aqua": "#00AAAA",
    "Dark Red": "#AA0000",
    "Dark Purple": "#AA00AA",
    "Gold": "#FFAA00",
    "Gray": "#AAAAAA",
    "Dark Gray": "#555555",
    "Blue": "#5555FF",
    "Green": "#55FF55",
    "Aqua": "#55FFFF",
    "Red": "#FF5555",
    "Light Purple": "#FF55FF",
    "Yellow": "#FFFF55",
    "White": "#FFFFFF",
    "Minecoin Gold": "#DDD605",
};

const shadowColorHex: Record<ColorName, string> = {
    "Black": "#000000",
    "Dark Blue": "#00002A",
    "Dark Green": "#002A00",
    "Dark Aqua": "#002A2A",
    "Dark Red": "#2A0000",
    "Dark Purple": "#2A002A",
    "Gold": "#402A00",
    "Gray": "#2A2A2A",
    "Dark Gray": "#151515",
    "Blue": "#15153F",
    "Green": "#153F15",
    "Aqua": "#153F3F",
    "Red": "#3F1515",
    "Light Purple": "#3F153F",
    "Yellow": "#3F3F15",
    "White": "#3F3F3F",
    "Minecoin Gold": "#373501",
};

const colorCodes = new Set<ColorCode>([
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "a", "b", "c", "d", "e", "f", "g",
]);

const styleCodes = new Set<StyleCode>(["k", "l", "m", "n", "o"]);

const isColorCode = (code: string): code is ColorCode => colorCodes.has(code as ColorCode);
const isStyleCode = (code: string): code is StyleCode => styleCodes.has(code as StyleCode);

const createDefaultState = (): McmdState => ({
    color: "White",
    format: [],
});

const applyFormatCode = (state: McmdState, code: string): McmdState => {
    if (isColorCode(code)) {
        return {
            ...state,
            color: formats[code] as ColorName,
        };
    }

    if (isStyleCode(code)) {
        const format = formats[code] as StyleName;
        return state.format.includes(format)
            ? state
            : { ...state, format: [...state.format, format] };
    }

    return createDefaultState();
};

const getFontName = (font: string, state: McmdState) => {
    const styles: string[] = [];

    if (state.format.includes("Bold")) styles.push("Bold");
    if (state.format.includes("Italic")) styles.push("Italic");

    return `"${font}${styles.length ? ` ${styles.join(" ")}` : ""}"`;
};

const applyTextStyle = (
    ctx: CanvasRenderingContext2D,
    font: string,
    fontSize: number,
    state: McmdState,
) => {
    ctx.fillStyle = colorHex[state.color];
    ctx.font = `${fontSize}px ${getFontName(font, state)}`;
};

const getShadowOffset = (fontSize: number) => fontSize / 8;

const drawLine = (
    ctx: CanvasRenderingContext2D,
    state: McmdState,
    oldX: number,
    x: number,
    y: number,
    lineWidth: number,
) => {
    let startX = oldX;
    let endX = x;

    switch (ctx.textAlign) {
        case "center":
            startX = oldX - (x - oldX) / 2;
            endX = oldX + (x - oldX) / 2;
            break;
        case "end":
        case "right":
            endX = oldX - (x - oldX);
            break;
    }

    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.strokeStyle = colorHex[state.color];
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
    ctx.closePath();
};

/**
 * Underline and strikethrough only support Mojangles font cleanly.
 */
export default function drawMinecraftText(
    string: string,
    ctx: CanvasRenderingContext2D,
    pos_x: number,
    pos_y: number,
    font: string,
    fontSize: number,
    STLift = 8,
    ULDrop = 6,
    lineWidth = 3,
): McmdResult {
    const text = string.replace(/Â§/g, "§");
    const sections = text.split("§");

    if (sections[0] !== "") {
        sections[0] = `r${sections[0]}`;
    }

    if (!sections.length) {
        sections.push(`r${text}`);
    }

    let state = createDefaultState();
    let x = pos_x;
    let oldAlign: CanvasRenderingContext2D["textAlign"] | undefined;

    if (["end", "right", "center"].includes(ctx.textAlign)) {
        sections.forEach(section => {
            const code = section.slice(0, 1);
            state = applyFormatCode(state, code);

            const restText = section.slice(1);
            applyTextStyle(ctx, font, fontSize, state);

            const width = ctx.measureText(restText).width;
            x -= ctx.textAlign === "center" ? width / 2 : width;
        });

        oldAlign = ctx.textAlign;
        ctx.textAlign = "left";
    }

    const adjustedX = x;
    state = createDefaultState();

    sections.forEach(section => {
        const code = section.slice(0, 1);
        state = applyFormatCode(state, code);

        const restText = section.slice(1);
        applyTextStyle(ctx, font, fontSize, state);

        const shadowOffset = getShadowOffset(fontSize);
        ctx.fillStyle = shadowColorHex[state.color];
        ctx.fillText(restText, x + shadowOffset, pos_y + shadowOffset);
        ctx.fillStyle = colorHex[state.color];
        ctx.fillText(restText, x, pos_y);

        const oldX = x;
        x += ctx.measureText(restText).width;

        if (state.format.includes("Underline")) {
            drawLine(ctx, state, oldX, x, pos_y + ULDrop, lineWidth);
        }

        if (state.format.includes("Strikethrough")) {
            drawLine(ctx, state, oldX, x, pos_y - STLift, lineWidth);
        }
    });

    if (oldAlign) {
        ctx.textAlign = oldAlign;
    }

    return {
        width: oldAlign && ["end", "right"].includes(oldAlign) ? pos_x - adjustedX : x - pos_x,
    };
}
