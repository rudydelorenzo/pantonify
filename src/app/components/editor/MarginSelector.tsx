import { ReactNode, useEffect, useState } from "react";
import { DEFAULT_MARGIN_SIZE, MARGIN_PRESETS } from "@/app/constants";
import { useCanvasStore } from "@/app/stores/canvas";
import { MarginPresetsType, UnitsType, ValueWithUnit } from "@/app/types";
import { SegmentedControlLabelled } from "@/app/components/wrappers/SegmentedControlLabelled";
import { useConfigStore } from "@/app/stores/config";
import { Button, Group, NumberInput, Stack } from "@mantine/core";
import { isEqual } from "lodash";
import { useShallow } from "zustand/react/shallow";

const CUSTOM_VALUE_LABEL = "Custom" as const;
const DEFAULT_CUSTOM_MARGIN = 0;

type MarginOptionsType = Record<
    string,
    MarginPresetsType[keyof MarginPresetsType][UnitsType] | null
>;

const getMarginOptions = (
    presets: MarginPresetsType,
    units: UnitsType,
): MarginOptionsType => {
    const result: MarginOptionsType = {};
    let size: keyof typeof presets;
    for (size in presets) {
        result[size] = presets[size][units];
    }

    // add custom option
    result[CUSTOM_VALUE_LABEL] = null;

    return result;
};

const getMarginValue = (
    margin: ValueWithUnit,
    marginOptions: MarginOptionsType,
): string => {
    let value: null | string = null;
    for (const k in marginOptions) {
        const v = marginOptions[k];
        if (isEqual(v, margin)) {
            value = k;
        }
    }
    if (!value) value = CUSTOM_VALUE_LABEL;

    return value;
};

export const MarginSelector = (): ReactNode => {
    const { units, orientation, ppi } = useCanvasStore(
        useShallow((state) => ({
            units: state.units,
            orientation: state.orientation,
            ppi: state.ppi,
        })),
    );
    const { setMargin, margin } = useConfigStore(
        useShallow((state) => ({
            margin: state.margin,
            setMargin: state.setMargin,
        })),
    );
    const [showCustomBox, setShowCustomBox] = useState(false);
    const [customBoxInput, setCustomBoxInput] = useState<number>(
        DEFAULT_CUSTOM_MARGIN,
    );
    const [sliderValue, setSliderValue] = useState<string>(DEFAULT_MARGIN_SIZE);
    const [marginOptions, setMarginOptions] = useState(
        getMarginOptions(MARGIN_PRESETS, units),
    );

    useEffect(() => {
        setMarginOptions(getMarginOptions(MARGIN_PRESETS, units));
    }, [units, orientation]);

    useEffect(() => {
        setSliderValue(getMarginValue(margin.withUnits, marginOptions));
    }, [margin, marginOptions]);

    const handleMarginChange = (value: string) => {
        const marginValue = marginOptions[value];
        if (!marginValue) {
            setSliderValue(CUSTOM_VALUE_LABEL);
            setShowCustomBox(true);
            setCustomBoxInput(DEFAULT_CUSTOM_MARGIN);
        } else {
            setMargin(marginValue, ppi);
            setShowCustomBox(false);
        }
    };

    const handleCustomMarginChange = (value: string | number) => {
        if (typeof value === "number") {
            setCustomBoxInput(value);
        } else {
            console.warn("Got `string` where we expected number");
        }
    };

    const handleClickApplyCustomMargin = () => {
        setMargin(
            {
                value: customBoxInput,
                units: units,
            },
            ppi,
        );
    };

    return (
        <Stack>
            <SegmentedControlLabelled
                label={"Margin size"}
                value={sliderValue}
                onChange={handleMarginChange}
                data={Object.keys(marginOptions)}
                transitionDuration={250}
                transitionTimingFunction={"ease"}
            />
            {showCustomBox && (
                <Group>
                    <NumberInput
                        label={`Custom margin size (${units})`}
                        value={customBoxInput}
                        onChange={handleCustomMarginChange}
                        suffix={` ${units}`}
                    />
                    <Button onClick={handleClickApplyCustomMargin}>
                        Apply
                    </Button>
                </Group>
            )}
        </Stack>
    );
};
