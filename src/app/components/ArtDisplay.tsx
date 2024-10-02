"use client";

import {
    ReactNode,
    RefObject,
    useEffect,
    useState,
    MouseEvent,
    useRef,
} from "react";
import { Size, ValueWithUnit } from "@/app/types";
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
    imageURL,
    topText,
    bottomText,
    dateText,
    margin,
    canvasSize,
    svgRef,
}: {
    imageURL?: string;
    topText: string;
    bottomText: string;
    margin: ValueWithUnit;
    canvasSize: Size;
    dateText?: string;
    svgRef: RefObject<SVGSVGElement>;
}): ReactNode => {
    const [paddingSize, setPaddingSize] = useState<Size>({ w: 0, h: 0 });
    const [realImageSize, setRealImageSize] = useState<Size>({ w: 0, h: 0 });
    const [imageOffset, setImageOffset] = useState<Size>({ w: 0, h: 0 });
    const { ppi } = useCanvasStore();
    const imageElementRef = useRef<SVGImageElement>(null);

    useEffect(() => {
        const imgElementTemporary = new Image();
        if (imageURL) {
            imgElementTemporary.src = imageURL;
        }
        imgElementTemporary.onload = () => {
            setRealImageSize({
                w: imgElementTemporary.width,
                h: imgElementTemporary.height,
            });
        };
        setImageOffset({ h: 0, w: 0 });
    }, [imageURL]);

    useEffect(() => {
        console.log(margin);
        setPaddingSize({
            w: valueWithUnitsToPixels(margin, ppi),
            h: valueWithUnitsToPixels(margin, ppi),
        });
    }, [margin, ppi]);

    const minimumPadding = valueWithUnitsToPixels(
        MARGIN_PRESETS[DEFAULT_MARGIN_SIZE][UNITS.cm],
        ppi,
    );

    const largeFontSize = FONT_SIZE_MULTIPLIER * canvasSize.h;
    const smallFontSize = largeFontSize / 2.5;

    const textPadding = canvasSize[getMaxAxis(canvasSize)] * 0.02;

    const imageFrameSize: Size = {
        w: canvasSize.w - 2 * paddingSize.w,
        h:
            canvasSize.h -
            paddingSize.h -
            smallFontSize -
            largeFontSize -
            4 * textPadding,
    };

    const bottomOfImage = paddingSize.h + imageFrameSize.h;
    const topTextPosition = bottomOfImage + textPadding + largeFontSize;
    const bottomTextPosition = topTextPosition + textPadding + smallFontSize;

    const leftTextXPosition = Math.max(minimumPadding, paddingSize.w);
    const rightTextXPosition = Math.max(canvasSize.w - leftTextXPosition);

    const handleDrag = (e: MouseEvent) => {
        const maxOffsets = computeMaximumOffsets(realImageSize, imageFrameSize);
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

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{
                background: "white",
                maxHeight: "90vh",
                minHeight: getMaxAxis(canvasSize) === "h" ? "90vh" : undefined,
                minWidth: getMaxAxis(canvasSize) === "w" ? "50vw" : undefined,
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
                href={imageURL}
                ref={imageElementRef}
                x={paddingSize.w + imageOffset.w}
                y={paddingSize.h + imageOffset.h}
                {...computeImageDimensions(realImageSize, imageFrameSize)}
                clipPath={"url(#image-mask)"}
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
