import { createCanvas } from "canvas";

const w = 40,
    h = 40;

const RETURN_MIME = "image/png";

export const dynamic = "force-dynamic"; // Prevents Next.js from caching this route

export async function GET() {
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = `hsl(${Math.random() * 360} 35% 60%)`;
    ctx.fillRect(2.5, 2.5, w - 5, h - 11);
    ctx.fillStyle = "#000";
    ctx.fillRect(2.5, h - 5, w - 20, 2);

    const dataUrl = canvas.toDataURL(RETURN_MIME);

    const dataFile = await (await fetch(dataUrl)).blob();

    return new Response(dataFile, { headers: { "content-type": RETURN_MIME } });
}
