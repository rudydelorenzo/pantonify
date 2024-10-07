import { PropertiesOfObjectWithType } from "@/app/types";
import {
    ConfigStoreAction,
    ConfigStoreState,
    useConfigStore,
} from "@/app/stores/config";
import { TextInput, TextInputProps } from "@mantine/core";
import { ChangeEvent, ReactNode } from "react";

export const ConfigTextInput = ({
    property,
    setter,
    inputProps,
}: {
    property: PropertiesOfObjectWithType<ConfigStoreState, string>;
    setter: PropertiesOfObjectWithType<
        ConfigStoreAction,
        (arg: string) => void
    >;
    inputProps?: TextInputProps;
}): ReactNode => {
    const setTopText = useConfigStore((state) => state[setter]);
    const topText = useConfigStore((state) => state[property]);

    const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTopText(event.target.value);
    };

    return (
        <TextInput
            label={"Title"}
            value={topText}
            placeholder={"Pantone"}
            onChange={handleTextChange}
            {...inputProps}
        />
    );
};
