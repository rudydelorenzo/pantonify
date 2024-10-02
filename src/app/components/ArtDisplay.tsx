"use client";

import { ReactNode, RefObject, MouseEvent, useRef } from "react";
import { Size } from "@/app/types";
import { DEFAULT_MARGIN_SIZE, MARGIN_PRESETS, UNITS } from "@/app/constants";
import { SvgText } from "@/app/components/SvgText";
import { useCanvasStore } from "@/app/stores/canvas";
import {
    computeImageDimensions,
    getFontSizes,
    getImageFrameSize,
    getMaxAxis,
    getTextPadding,
    valueWithUnitsToPixels,
} from "@/app/helpers";
import useDrag from "@/app/hooks/useDrag";
import { Center, Text } from "@mantine/core";
import { useConfigStore } from "@/app/stores/config";

const MOVEMENT_SPEED_MULTIPLIER = 7;

export const ArtDisplay = ({
    svgRef,
}: {
    svgRef: RefObject<SVGSVGElement>;
}): ReactNode => {
    const { pixelSize, ppi } = useCanvasStore();
    const {
        image,
        topText,
        bottomText,
        dateText,
        margin,
        offsets,
        setOffsets,
    } = useConfigStore();
    const imageElementRef = useRef<SVGImageElement>(null);

    const handleDrag = (e: MouseEvent) => {
        const newW = offsets.w + e.movementX * MOVEMENT_SPEED_MULTIPLIER;
        const newH = offsets.h + e.movementY * MOVEMENT_SPEED_MULTIPLIER;
        setOffsets({ h: newH, w: newW }, undefined);
    };

    useDrag(imageElementRef, [offsets], {
        onDrag: handleDrag,
    });

    const shouldRender = image && image.url && pixelSize;

    if (!shouldRender) {
        return (
            <Center h={"100%"}>
                <Text>{"Select an image and print size to get started!"}</Text>
            </Center>
        );
    }

    const minimumTextPadding = valueWithUnitsToPixels(
        MARGIN_PRESETS[DEFAULT_MARGIN_SIZE][UNITS.cm],
        ppi,
    );

    const textPadding = getTextPadding(pixelSize);
    const { smallFontSize, largeFontSize } = getFontSizes(pixelSize);

    const imageFrameSize: Size = getImageFrameSize(pixelSize, margin.pixels);

    const bottomOfImage = margin.pixels.h + imageFrameSize.h;
    const topTextPosition = bottomOfImage + textPadding + largeFontSize;
    const bottomTextPosition = topTextPosition + textPadding + smallFontSize;

    const leftTextXPosition = Math.max(minimumTextPadding, margin.pixels.w);
    const rightTextXPosition = Math.max(pixelSize.w - leftTextXPosition);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${pixelSize.w} ${pixelSize.h}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{
                background: "white",
                maxHeight: "70vh",
                maxWidth: "50vw",
                minHeight: getMaxAxis(pixelSize) === "h" ? "70vh" : undefined,
                minWidth: getMaxAxis(pixelSize) === "w" ? "50vw" : undefined,
            }}
        >
            <defs>
                <clipPath id="image-mask">
                    <rect
                        x={margin.pixels.w}
                        y={margin.pixels.h}
                        width={imageFrameSize.w}
                        height={imageFrameSize.h}
                    />
                </clipPath>
            </defs>
            <image
                href={image.url}
                ref={imageElementRef}
                x={margin.pixels.w + offsets.w}
                y={margin.pixels.h + offsets.h}
                {...computeImageDimensions(image.size, imageFrameSize)}
                clipPath={"url(#image-mask)"}
                style={{ cursor: "move" }}
            />
            <SvgText
                id={"topText"}
                x={leftTextXPosition}
                y={topTextPosition}
                fontSize={largeFontSize}
                fontWeight={"bold"}
                textContent={topText}
            />
            <SvgText
                id={"bottomText"}
                x={leftTextXPosition}
                y={bottomTextPosition}
                fontSize={smallFontSize}
                fontWeight={"normal"}
                textContent={bottomText}
            />
            {dateText && (
                <SvgText
                    id={"dateText"}
                    x={rightTextXPosition}
                    y={bottomTextPosition}
                    textAnchor={"end"}
                    fontSize={smallFontSize}
                    fontWeight={"normal"}
                    textContent={dateText}
                />
            )}
        </svg>
    );
};
