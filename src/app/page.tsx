"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
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
    Select,
    NumberInput,
} from "@mantine/core";
import {
    DEFAULT_MARGIN_SIZE,
    MARGIN_PRESETS,
    ORIENTATIONS,
    PRINT_SIZES,
    SRC_URL_REGEX,
    UNITS,
} from "@/app/constants";
import { blobToURI, physicalSizeToString } from "@/app/helpers";
import { useConfigStore } from "@/app/stores/config";
import {
    MarginPresetsType,
    OrientationType,
    PhysicalSize,
    UnitsType,
} from "@/app/types";
import { useCanvasStore } from "@/app/stores/canvas";

const downloadURI = (uri: string, name: string) => {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const substituteURLsWithURI = async (cssString: string): Promise<string> => {
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
                    rules.push(await substituteURLsWithURI(ruleText));
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
     * the browser will block that request. To get around this we must define the @font-face declaration in the SVG
     * itself, and instead of having the URL of the font file in the 'src' field, we swap it to be a data URI
     * representation of what that URL points to. Got it? Good. I'm going to bed now
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

const getSizeOptions = (
    orientation: OrientationType,
    units: UnitsType,
): { [key in string]: PhysicalSize } => {
    const sizesInUnit = PRINT_SIZES.filter((item) => item[2] === units);
    const sizes = sizesInUnit.map(
        (size): PhysicalSize => ({
            w: {
                value:
                    orientation === ORIENTATIONS.landscape
                        ? Math.max(size[0], size[1])
                        : Math.min(size[0], size[1]),
                units,
            },
            h: {
                value:
                    orientation === ORIENTATIONS.landscape
                        ? Math.min(size[0], size[1])
                        : Math.max(size[0], size[1]),
                units,
            },
        }),
    );
    const result: { [key in string]: PhysicalSize } = {};
    for (const size of sizes) {
        result[physicalSizeToString(size)] = size;
    }
    return result;
};

const getMarginOptions = (
    presets: MarginPresetsType,
    units: UnitsType,
): Record<
    string,
    MarginPresetsType[keyof MarginPresetsType][UnitsType] | undefined
> => {
    const result: Record<
        string,
        MarginPresetsType[keyof MarginPresetsType][UnitsType] | undefined
    > = {};
    let size: keyof typeof presets;
    for (size in presets) {
        result[size] = presets[size][units];
    }

    // add custom option
    result["Custom"] = undefined;

    return result;
};

export default function Home() {
    const { setPrintSize, printSize, pixelSize } = useCanvasStore();
    const configStore = useConfigStore();
    const [units, setUnits] = useState<UnitsType>(UNITS.cm);
    const [orientation, setOrientation] = useState<OrientationType>(
        ORIENTATIONS.portrait,
    );
    const [sizeOptions, setSizeOptions] = useState<{
        [key in string]: PhysicalSize;
    }>(getSizeOptions(orientation, units));
    const [marginOptions, setMarginOptions] = useState(
        getMarginOptions(MARGIN_PRESETS, units),
    );
    const [marginSizeLocalState, setMarginSizeLocalState] =
        useState<keyof typeof marginOptions>(DEFAULT_MARGIN_SIZE);
    const [customMarginSizeLocalState, setCustomMarginSizeLocalState] =
        useState<number>(0);

    const svgCanvasElement = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        setSizeOptions(getSizeOptions(orientation, units));
        setMarginOptions(getMarginOptions(MARGIN_PRESETS, units));
        setPrintSize(null);
    }, [units, orientation]);

    // this useEffect handles synchronization between local state and global state
    useEffect(() => {
        const marginValue = marginOptions[marginSizeLocalState];
        if (marginValue) {
            configStore.setMargin(marginValue);
        } else {
            configStore.setMargin({
                value: customMarginSizeLocalState,
                units: units,
            });
        }
    }, [marginSizeLocalState, customMarginSizeLocalState, units]);

    const handleUnitsChange = (value: string) => {
        setUnits(value as UnitsType);
    };
    const handleFileChange = async (payload: File | null) => {
        if (payload) {
            configStore.setImageUrl((await blobToURI(payload)) || "");
        }
    };
    const handleTopTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        configStore.setTopText(event.target.value);
    };
    const handleBottomTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        configStore.setBottomText(event.target.value);
    };
    const handleDateTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        configStore.setDateText(event.target.value);
    };
    const handleMarginChange = (value: string) => {
        setMarginSizeLocalState(value);
    };
    const handleCustomMarginChange = (value: number | string) => {
        if (typeof value === "number") {
            setCustomMarginSizeLocalState(value);
        } else {
            console.warn("received string type for custom margin size");
        }
    };
    const handlePrintSizeChange = (value: string | null) => {
        setPrintSize(value ? sizeOptions[value] : null);
    };
    const handleRenderImage = async () => {
        const canvas = document.createElement("canvas");
        const w = svgCanvasElement.current?.viewBox.baseVal.width || 0;
        const h = svgCanvasElement.current?.viewBox.baseVal.height || 0;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");

        if (ctx && svgCanvasElement.current) {
            const svg = new Blob(
                [await svgElementToString(svgCanvasElement.current)],
                {
                    type: "image/svg+xml",
                },
            );
            const url = URL.createObjectURL(svg);

            const img = new Image();
            img.onload = function () {
                ctx.drawImage(img, 0, 0, w, h);
                URL.revokeObjectURL(url);
                const png_img = canvas.toDataURL("image/png");
                downloadURI(
                    png_img,
                    `EXPORT_${configStore.topText}_${configStore.bottomText}.png`,
                );
            };
            img.src = url;
        }
    };

    return (
        <Center mih={"100vh"} miw={"100%"}>
            <Flex gap={"5rem"}>
                <div style={{ height: "90vh" }}>
                    <Center mih={"100%"}>
                        {configStore.imageUrl !== "" && pixelSize ? (
                            <ArtDisplay
                                imageURL={configStore.imageUrl}
                                topText={configStore.topText}
                                bottomText={configStore.bottomText}
                                dateText={configStore.dateText}
                                margin={configStore.margin}
                                canvasSize={pixelSize}
                                svgRef={svgCanvasElement}
                            />
                        ) : (
                            <Text size={"xl"}>Select an image to start!</Text>
                        )}
                    </Center>
                </div>
                <Center>
                    <Stack>
                        <SegmentedControl
                            value={`${units}`}
                            onChange={handleUnitsChange}
                            data={[
                                { label: "cm", value: UNITS.cm },
                                { label: "in", value: UNITS.in },
                            ]}
                            transitionDuration={250}
                            transitionTimingFunction={"linear"}
                        />
                        <SegmentedControl
                            value={`${orientation}`}
                            onChange={(val) =>
                                setOrientation(val as OrientationType)
                            }
                            data={[
                                ORIENTATIONS.portrait,
                                ORIENTATIONS.landscape,
                            ]}
                            transitionDuration={250}
                            transitionTimingFunction={"linear"}
                        />
                        <Select
                            label={"Print size (W x H)"}
                            data={Object.keys(sizeOptions)}
                            // caution: passing in undefined will cause unpredictable behaviour
                            value={
                                printSize
                                    ? physicalSizeToString(printSize)
                                    : null
                            }
                            onChange={handlePrintSizeChange}
                            allowDeselect={false}
                        />
                        <FileInput
                            label={"Image"}
                            placeholder={"Pick an image..."}
                            onChange={handleFileChange}
                        />
                        <TextInput
                            label={"Title"}
                            value={configStore.topText}
                            placeholder={"Pantone"}
                            onChange={handleTopTextChange}
                        />
                        <TextInput
                            label={"Subtitle"}
                            value={configStore.bottomText}
                            placeholder={"Sub Title"}
                            onChange={handleBottomTextChange}
                        />
                        <TextInput
                            label={"Date"}
                            value={configStore.dateText}
                            placeholder={"Date text"}
                            onChange={handleDateTextChange}
                        />
                        <SegmentedControl
                            value={marginSizeLocalState}
                            onChange={handleMarginChange}
                            data={Object.keys(marginOptions)}
                            transitionDuration={250}
                            transitionTimingFunction={"ease"}
                        />
                        {marginSizeLocalState === "Custom" && (
                            <NumberInput
                                label={`Custom margin size (${units})`}
                                value={customMarginSizeLocalState}
                                onChange={handleCustomMarginChange}
                                suffix={` ${units}`}
                            />
                        )}
                        <Button onClick={handleRenderImage}>
                            Export as PNG...
                        </Button>
                    </Stack>
                </Center>
            </Flex>
        </Center>
    );
}
