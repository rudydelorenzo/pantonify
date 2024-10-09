import { PropertiesOfObjectWithType } from "@/app/types";
import { NumberInput, NumberInputProps } from "@mantine/core";
import { ReactNode } from "react";
import { UseBoundStore, StoreApi } from "zustand";

type AllowedTypes = number;
type SetterFnType = (arg: number) => void;

export const StatefulNumberInput = <T,>({
    store,
    property,
    setter,
    inputProps,
}: {
    store: UseBoundStore<StoreApi<T>>;
    property: PropertiesOfObjectWithType<T, AllowedTypes>;
    setter: PropertiesOfObjectWithType<T, SetterFnType>;
    inputProps?: NumberInputProps;
}): ReactNode => {
    const value = store((state) => state[property]) as AllowedTypes;
    const setterFn = store((state) => state[setter]) as SetterFnType;

    const handleValueChange = (value: string | number) => {
        if (typeof value === "number") {
            setterFn(value);
        } else {
            console.warn("Got `string` where we expected number");
        }
    };

    return (
        <NumberInput
            label={"Title"}
            value={value}
            placeholder={"Pantone"}
            onChange={handleValueChange}
            {...inputProps}
        />
    );
};
