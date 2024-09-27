import { CSSProperties, ReactNode, SVGProps } from "react";
import { helveticaNeue } from "@/app/fonts";
import { mergeStyles } from "@/app/helpers";

const DEFAULT_STYLES: CSSProperties = { userSelect: "none" };

export const SvgText = ({
    x,
    y,
    fontSize,
    fontWeight,
    textContent,
    style,
    ...rest
}: Required<
    Pick<SVGProps<SVGTextElement>, "x" | "y" | "fontSize" | "fontWeight">
> &
    SVGProps<SVGTextElement> & { textContent: string }): ReactNode => {
    const styles = mergeStyles(DEFAULT_STYLES, style);

    return (
        <text
            x={x}
            y={y}
            fontSize={fontSize}
            fontFamily={helveticaNeue.style.fontFamily}
            fontWeight={fontWeight}
            style={styles}
            {...rest}
        >
            {textContent.toUpperCase()}
        </text>
    );
};
