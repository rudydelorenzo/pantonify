"use client";

import { ReactNode, RefObject, useEffect, useState } from "react";
import { Size } from "@/app/types";
import { helveticaNeue } from "@/app/fonts";
import { DEFAULT_PADDING_PERCENT, FONT_SIZE_MULTIPLIER } from "@/app/constants";

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
    );
    const rightTextXPosition = Math.max(canvasSize.w - leftTextXPosition);

    return (
        <div
            style={{
                boxShadow: "2px 3px 35px 11px rgba(0, 0, 0, 1)",
                minHeight: "100%",
            }}
        >
            <svg
                ref={svgRef}
                viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    background: "white",
                    maxHeight: "90vh",
                    maxWidth: "50vw",
                    minHeight:
                        getMaxAxis(canvasSize) === "h" ? "90vh" : undefined,
                    minWidth:
                        getMaxAxis(canvasSize) === "w" ? "50vw" : undefined,
                }}
            >
                <image href={imageURL} x={paddingSize.w} y={paddingSize.h} />
                <text
                    id={"topText"}
                    x={leftTextXPosition}
                    y={topTextPosition}
                    fontSize={largeFontSize}
                    fontFamily={helveticaNeue.style.fontFamily}
                    fontWeight={"bold"}
                    style={{ userSelect: "none" }}
                >
                    {topText.toUpperCase()}
                </text>
                <text
                    id={"bottomText"}
                    x={leftTextXPosition}
                    y={bottomTextPosition}
                    fontSize={smallFontSize}
                    fontWeight={"normal"}
                    fontFamily={helveticaNeue.style.fontFamily}
                    style={{ userSelect: "none" }}
                >
                    {bottomText.toUpperCase()}
                </text>
                {dateText && (
                    <text
                        id={"dateText"}
                        x={rightTextXPosition}
                        y={bottomTextPosition}
                        textAnchor={"end"}
                        fontSize={smallFontSize}
                        fontWeight={"normal"}
                        fontFamily={helveticaNeue.style.fontFamily}
                        style={{ userSelect: "none" }}
                    >
                        {dateText.toUpperCase()}
                    </text>
                )}
            </svg>
        </div>
    );
};
