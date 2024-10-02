"use client";

import {
    ReactNode,
    RefObject,
    useEffect,
    useState,
    MouseEvent,
    useRef,
} from "react";
import { Size } from "@/app/types";
import {
    DEFAULT_MARGIN_SIZE,
    FONT_SIZE_MULTIPLIER,
    MARGIN_PRESETS,
    UNITS,
} from "@/app/constants";
import { SvgText } from "@/app/components/SvgText";
import { useCanvasStore } from "@/app/stores/canvas";
import { valueWithUnitsToPixels } from "@/app/helpers";
import useDrag from "@/app/hooks/useDrag";
import { Center, Text } from "@mantine/core";
import { useConfigStore } from "@/app/stores/config";

const getMaxAxis = <T extends Size>(s: T): keyof T => {
    let largest: keyof T = (Object.keys(s) as (keyof T)[])[0];
    for (const axis in s) {
        if (s[largest] < s[axis]) {
            largest = axis;
        }
    }
    return largest;
};

const computeImageDimensions = (
    imageSize: Size,
    imageFrameSize: Size,
): { width: number; height: number } => {
    // Calculate the aspect ratios
    const imageAspectRatio = imageSize.w / imageSize.h;
    const containerAspectRatio = imageFrameSize.w / imageFrameSize.h;

    let finalWidth, finalHeight;
    // Compare aspect ratios to determine whether to scale based on width or height
    if (imageAspectRatio > containerAspectRatio) {
        // Image is wider than container, scale based on height
        finalHeight = imageFrameSize.h;
        finalWidth = imageFrameSize.h * imageAspectRatio;
    } else {
        // Image is taller than container, scale based on width
        finalWidth = imageFrameSize.w;
        finalHeight = imageFrameSize.w / imageAspectRatio;
    }
    return { width: finalWidth, height: finalHeight };
};

const computeMaximumOffsets = (imageSize: Size, imageFrameSize: Size): Size => {
    const finalImageDimensions = computeImageDimensions(
        imageSize,
        imageFrameSize,
    );

    return {
        w: -(finalImageDimensions.width - imageFrameSize.w),
        h: -(finalImageDimensions.height - imageFrameSize.h),
    };
};

const MOVEMENT_SPEED_MULTIPLIER = 7;

export const ArtDisplay = ({
    svgRef,
}: {
    svgRef: RefObject<SVGSVGElement>;
}): ReactNode => {
    const [paddingSize, setPaddingSize] = useState<Size>({ w: 0, h: 0 });
    const [imageOffset, setImageOffset] = useState<Size>({ w: 0, h: 0 });
    const { pixelSize, ppi } = useCanvasStore();
    const { image, topText, bottomText, dateText, margin } = useConfigStore();
    const imageElementRef = useRef<SVGImageElement>(null);

    useEffect(() => {
        console.log(margin);
        setPaddingSize({
            w: valueWithUnitsToPixels(margin, ppi),
            h: valueWithUnitsToPixels(margin, ppi),
        });
    }, [margin, ppi]);

    const handleDrag = (e: MouseEvent) => {
        if (!image?.size) return;
        const maxOffsets = computeMaximumOffsets(image.size, imageFrameSize);
        const newProspectiveOffsets = {
            w: Math.min(
                Math.max(
                    imageOffset.w + e.movementX * MOVEMENT_SPEED_MULTIPLIER,
                    maxOffsets.w,
                ),
                0,
            ),
            h: Math.min(
                Math.max(
                    imageOffset.h + e.movementY * MOVEMENT_SPEED_MULTIPLIER,
                    maxOffsets.h,
                ),
                0,
            ),
        };
        setImageOffset(newProspectiveOffsets);
    };

    useDrag(imageElementRef, [imageOffset], {
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

    const largeFontSize =
        FONT_SIZE_MULTIPLIER * pixelSize[getMaxAxis(pixelSize)];
    const smallFontSize = largeFontSize / 2.5;

    const textPadding = pixelSize[getMaxAxis(pixelSize)] * 0.02;

    const imageFrameSize: Size = {
        w: pixelSize.w - 2 * paddingSize.w,
        h:
            pixelSize.h -
            paddingSize.h -
            smallFontSize -
            largeFontSize -
            4 * textPadding,
    };

    const bottomOfImage = paddingSize.h + imageFrameSize.h;
    const topTextPosition = bottomOfImage + textPadding + largeFontSize;
    const bottomTextPosition = topTextPosition + textPadding + smallFontSize;

    const leftTextXPosition = Math.max(minimumTextPadding, paddingSize.w);
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
                        x={paddingSize.w}
                        y={paddingSize.h}
                        width={imageFrameSize.w}
                        height={imageFrameSize.h}
                    />
                </clipPath>
            </defs>
            <image
                href={image.url}
                ref={imageElementRef}
                x={paddingSize.w + imageOffset.w}
                y={paddingSize.h + imageOffset.h}
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
