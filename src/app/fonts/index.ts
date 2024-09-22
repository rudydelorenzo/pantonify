import localFont from "next/font/local";

export const helveticaNeue = localFont({
    src: [
        {
            path: "./helvetica-neue-55/HelveticaNeueBold.ttf",
            weight: "bold",
            style: "normal",
        },
        {
            path: "./helvetica-neue-55/HelveticaNeueMedium.ttf",
            weight: "normal",
            style: "normal",
        },
    ],
    variable: "--font-helvetica-neue",
});
