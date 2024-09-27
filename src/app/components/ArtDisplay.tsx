"use client";

import { ReactNode, RefObject, useEffect, useState } from "react";
import { Size } from "@/app/types";
import { DEFAULT_PADDING_PERCENT, FONT_SIZE_MULTIPLIER } from "@/app/constants";
import { SvgText } from "@/app/components/SvgText";

const getMaxAxis = <T extends Size>(s: T): keyof T => {
    let largest: keyof T = (Object.keys(s) as (keyof T)[])[0];
    for (const axis in s) {
        if (s[largest] < s[axis]) {
            largest = axis;
        }
    }
    return largest;
};

export const ArtDisplay = ({
    imageURL,
    topText,
    bottomText,
    dateText,
    paddingPercent,
    svgRef,
}: {
    imageURL?: string;
    topText: string;
    bottomText: string;
    paddingPercent: number;
    dateText?: string;
    svgRef: RefObject<SVGSVGElement>;
}): ReactNode => {
    const [imageSize, setImageSize] = useState<Size>({ w: 0, h: 0 });
    const [paddingSize, setPaddingSize] = useState<Size>({ w: 0, h: 0 });

    useEffect(() => {
        const imgElementTemporary = new Image();
        if (imageURL) {
            imgElementTemporary.src = imageURL;
        }
        imgElementTemporary.onload = () => {
            setImageSize({
                w: imgElementTemporary.width,
                h: imgElementTemporary.height,
            });
        };
    }, [imageURL]);
    useEffect(() => {
        setPaddingSize({
            w: paddingPercent * imageSize[getMaxAxis(imageSize)],
            h: paddingPercent * imageSize[getMaxAxis(imageSize)],
        });
    }, [imageSize, paddingPercent]);

    const largeFontSize = FONT_SIZE_MULTIPLIER * imageSize.h;
    const smallFontSize = largeFontSize / 2.5;

    const textPadding = imageSize[getMaxAxis(imageSize)] * 0.02;

    const canvasSize: Size = {
        w: imageSize.w + 2 * paddingSize.w,
        h:
            imageSize.h +
            paddingSize.h +
            smallFontSize +
            largeFontSize +
            4 * textPadding,
    };

    const bottomOfImage = imageSize.h + paddingSize.h;
    const topTextPosition = bottomOfImage + textPadding + largeFontSize;
    const bottomTextPosition = topTextPosition + textPadding + smallFontSize;

    const leftTextXPosition = Math.max(
        DEFAULT_PADDING_PERCENT * imageSize[getMaxAxis(imageSize)],
        paddingSize.w,
    );
    const rightTextXPosition = Math.max(canvasSize.w - leftTextXPosition);

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
            <image href={imageURL} x={paddingSize.w} y={paddingSize.h} />
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
