import { useState, useEffect, RefObject, MouseEvent } from "react";

const useDrag = (
    ref: RefObject<Element>,
    deps: unknown[] = [],
    options: {
        onPointerDown?: (e: MouseEvent) => void;
        onPointerUp?: (e: MouseEvent) => void;
        onPointerMove?: (e: MouseEvent) => void;
        onDrag?: (e: MouseEvent) => void;
    },
) => {
    const {
        onPointerDown = () => {},
        onPointerUp = () => {},
        onPointerMove = () => {},
        onDrag = () => {},
    } = options;

    const [isDragging, setIsDragging] = useState(false);

    const handlePointerDown = (e: Event) => {
        setIsDragging(true);

        onPointerDown(e as unknown as MouseEvent);
    };

    const handlePointerUp = (e: Event) => {
        setIsDragging(false);

        onPointerUp(e as unknown as MouseEvent);
    };

    const handlePointerMove = (e: Event) => {
        onPointerMove(e as unknown as MouseEvent);

        if (isDragging) {
            onDrag(e as unknown as MouseEvent);
        }
    };

    useEffect(() => {
        const element = ref?.current;
        if (element) {
            element.addEventListener("mousedown", handlePointerDown);
            element.addEventListener("mouseup", handlePointerUp);
            element.addEventListener("mousemove", handlePointerMove);
            element.addEventListener("mouseout", handlePointerUp);

            return () => {
                element.removeEventListener("mousedown", handlePointerDown);
                element.removeEventListener("mouseup", handlePointerUp);
                element.removeEventListener("mousemove", handlePointerMove);
                element.removeEventListener("mouseout", handlePointerUp);
            };
        }

        return () => {};
        // spreading these is necessary for the hook to work, thus we silence the warning
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, isDragging]);

    return { isDragging };
};

export default useDrag;
