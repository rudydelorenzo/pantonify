"use client";

import { ChangeEvent, useRef, useState } from "react";
import { ArtDisplay } from "@/app/components/ArtDisplay";
import {
    Button,
    Center,
    FileInput,
    Flex,
    Stack,
    TextInput,
    Text,
    SegmentedControl,
} from "@mantine/core";
import { DEFAULT_PADDING_PERCENT, SRC_URL_REGEX } from "@/app/constants";
import { blobToURI } from "@/app/helpers";

const downloadURI = (uri: string, name: string) => {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const sanitizeURL = async (cssString: string): Promise<string> => {
    const url = cssString.match(SRC_URL_REGEX)?.[1];
    if (url) {
        const blob = await (await fetch(url)).blob();
        const uri = await blobToURI(blob);
        if (uri) {
            cssString = cssString.replace(url, uri);
        }
    }
    return cssString;
};

const getCSSFontRules = async (): Promise<string> => {
    const rules: string[] = [];
    for (const stylesheet of document.styleSheets) {
        for (const rule of stylesheet.cssRules) {
            if (rule.type === rule.FONT_FACE_RULE) {
                const ruleText = rule.cssText;
                // dedupe
                let alreadyInList = false;
                for (const item of rules) {
                    if (ruleText === item) {
                        alreadyInList = true;
                        break;
                    }
                }
                if (!alreadyInList) {
                    rules.push(await sanitizeURL(ruleText));
                }
            }
        }
    }
    return rules.join("\n");
};

const svgElementToString = async (svgElement: Node): Promise<string> => {
    // first we serialize the document to a string
    const serializer = new XMLSerializer();
    const serializedString = serializer.serializeToString(svgElement);

    // now we re-parse it into an XML document object. this allows us to inject font styles
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(
        serializedString,
        "image/svg+xml",
    );

    /* We need to embed the fonts as data URIs in the SVG. Why? Glad you asked. When we load the SVG into an
     * <img> element (so we can then draw it on the canvas) the browser is very strict about not letting that <img>
     * element establish any outbound network connections. Thus, when the <img> element tries to load the font from
     * the URL (as determined by the @font-face.src property present in the global document stylesheet),
     * the browser won't let it. To get around this we must define the @font-face declaration in the SVG itself,
     * and instead of having the URL of the font file in the 'src' field, we swap it to be a data URI representation
     * of what that URL points to. Got it? Good. I'm going to bed now
     */
    const svgNS = "http://www.w3.org/2000/svg";
    const defs = xmlDocument.createElementNS(svgNS, "defs");
    const style = xmlDocument.createElementNS(svgNS, "style");
    style.innerHTML = await getCSSFontRules();
    defs.appendChild(style);
    xmlDocument.documentElement.appendChild(defs);

    // we re-serialize the edited svg, and return it
    return serializer.serializeToString(xmlDocument);
};

export default function Home() {
    const [fileUri, setFileUri] = useState<string>();
    const [topText, setTopText] = useState<string>("");
    const [bottomText, setBottomText] = useState<string>("");
    const [paddingPercentage, setPaddingPercentage] = useState<number>(
        DEFAULT_PADDING_PERCENT,
    );
    const [dateText, setDateText] = useState<string>("");
    const svgCanvasElement = useRef<SVGSVGElement | null>(null);

    const handleFileChange = async (payload: File | null) => {
        if (payload) {
            setFileUri(await blobToURI(payload));
        }
    };
    const handleTopTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTopText(event.target.value);
    };
    const handleBottomTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        setBottomText(event.target.value);
    };
    const handleDateTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        setDateText(event.target.value);
    };
    const handlePaddingPercentChange = (value: string) => {
        setPaddingPercentage(Number.parseFloat(value));
    };
    const handleRenderImage = async () => {
        const canvas = document.createElement("canvas");
        const w = svgCanvasElement.current?.viewBox.baseVal.width || 0;
        const h = svgCanvasElement.current?.viewBox.baseVal.height || 0;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");

        if (ctx && svgCanvasElement.current) {
            const img = new Image();

            const svg = new Blob(
                [await svgElementToString(svgCanvasElement.current)],
                {
                    type: "image/svg+xml",
                },
            );
            const url = URL.createObjectURL(svg);

            img.onload = function () {
                ctx.drawImage(img, 0, 0, w, h);
                URL.revokeObjectURL(url);
                const png_img = canvas.toDataURL("image/png");
                downloadURI(png_img, "hello.png");
            };

            img.src = url;
        }
    };

    return (
        <Center mih={"100vh"} miw={"100%"}>
            <Flex gap={"5rem"}>
                <div style={{ height: "90vh" }}>
                    <Center mih={"100%"}>
                        {fileUri ? (
                            <ArtDisplay
                                imageURL={fileUri}
                                topText={topText}
                                bottomText={bottomText}
                                dateText={dateText}
                                paddingPercent={paddingPercentage}
                                svgRef={svgCanvasElement}
                            />
                        ) : (
                            <Text size={"xl"}>Select an image to start!</Text>
                        )}
                    </Center>
                </div>
                <Center>
                    <Stack>
                        <FileInput
                            label={"Image"}
                            placeholder={"Pick an image..."}
                            onChange={handleFileChange}
                        />
                        <TextInput
                            label={"Title"}
                            value={topText}
                            placeholder={"Pantone"}
                            onChange={handleTopTextChange}
                        />
                        <TextInput
                            label={"Subtitle"}
                            value={bottomText}
                            placeholder={"Sub Title"}
                            onChange={handleBottomTextChange}
                        />
                        <TextInput
                            label={"Date"}
                            value={dateText}
                            placeholder={"Date text"}
                            onChange={handleDateTextChange}
                        />
                        <SegmentedControl
                            value={`${paddingPercentage}`}
                            onChange={handlePaddingPercentChange}
                            data={[
                                { label: "None", value: (0).toString() },
                                {
                                    label: "Small",
                                    value: (
                                        DEFAULT_PADDING_PERCENT / 2
                                    ).toString(),
                                },
                                {
                                    label: "Regular",
                                    value: DEFAULT_PADDING_PERCENT.toString(),
                                },
                                {
                                    label: "Large",
                                    value: (
                                        DEFAULT_PADDING_PERCENT * 2
                                    ).toString(),
                                },
                            ]}
                        />
                        <Button onClick={handleRenderImage}>
                            Export as PNG...
                        </Button>
                    </Stack>
                </Center>
            </Flex>
        </Center>
    );
}
