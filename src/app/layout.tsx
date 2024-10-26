import type { Metadata } from "next";
import "./globals.css";
import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { helveticaNeue } from "@/app/fonts";

export const metadata: Metadata = {
    title: "Pantonify",
    description: "Put your art into a pantone color chip",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/api/favicon" sizes="any" />
                <ColorSchemeScript />
            </head>
            <body className={helveticaNeue.className}>
                <MantineProvider defaultColorScheme={"dark"}>
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
