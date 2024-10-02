import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useCanvasStore } from "@/app/stores/canvas";
import { useConfigStore } from "@/app/stores/config";
import {
    MarginPresetsType,
    OrientationType,
    PhysicalSize,
    UnitsType,
} from "@/app/types";
import {
    DEFAULT_MARGIN_SIZE,
    MARGIN_PRESETS,
    ORIENTATIONS,
    PRINT_SIZES,
    UNITS,
} from "@/app/constants";
import {
    blobToURI,
    downloadURI,
    physicalSizeToString,
    svgElementToString,
} from "@/app/helpers";
import {
    Button,
    Center,
    FileInput,
    Flex,
    NumberInput,
    SegmentedControl,
    Select,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { ArtDisplay } from "@/app/components/ArtDisplay";

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

export const Editor = (): ReactNode => {
    const { setPrintSize, printSize, pixelSize } = useCanvasStore();
    const configStore = useConfigStore();
    const [units, setUnits] = useState<UnitsType>(UNITS.cm);
    const [orientation, setOrientation] = useState<OrientationType>(
        ORIENTATIONS.portrait,
    );

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
        <Flex gap={"5rem"}>
            <div style={{ height: "100%" }}>
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
                    <Center>
                        <Title>🌄 Pantonify</Title>
                    </Center>
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
    );
};
