import { PropertiesOfObjectWithType } from "@/app/types";
import { TextInput, TextInputProps } from "@mantine/core";
import { ChangeEvent, ReactNode } from "react";
import { UseBoundStore, StoreApi } from "zustand";

type AllowedTypes = TextInputProps["value"];
type SetterFnType = (arg: string) => void;

export const StatefulTextInput = <T,>({
    store,
    property,
    setter,
    inputProps,
}: {
    store: UseBoundStore<StoreApi<T>>;
    property: PropertiesOfObjectWithType<T, AllowedTypes>;
    setter: PropertiesOfObjectWithType<T, SetterFnType>;
    inputProps?: TextInputProps;
}): ReactNode => {
    const value = store((state) => state[property]) as AllowedTypes;
    const setterFn = store((state) => state[setter]) as SetterFnType;

    const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        setterFn(event.target.value);
    };

    return (
        <TextInput
            label={"Title"}
            value={value}
            placeholder={"Pantone"}
            onChange={handleTextChange}
            {...inputProps}
        />
    );
};
