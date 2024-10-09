import { useEffect, RefObject } from "react";

const useScroll = (
    ref: RefObject<Element>,
    deps: unknown[] = [],
    options: {
        onScroll?: (e: WheelEvent) => void;
    },
) => {
    const { onScroll = () => {} } = options;

    const handleMouseWheel = (e: Event) => {
        onScroll(e as unknown as WheelEvent);
    };

    useEffect(() => {
        const element = ref?.current;
        if (element) {
            element.addEventListener("mousewheel", handleMouseWheel);

            return () => {
                element.removeEventListener("mousewheel", handleMouseWheel);
            };
        }

        return () => {};
        // spreading these is necessary for the hook to work, thus we silence the warning
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps]);

    return;
};

export default useScroll;
