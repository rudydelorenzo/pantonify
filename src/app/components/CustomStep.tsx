import { ComponentProps, ReactNode } from "react";
import { Stepper } from "@mantine/core";

export const CustomStep = (
    props: ComponentProps<typeof Stepper.Step>,
): ReactNode => {
    return <Stepper.Step p={20} {...props}></Stepper.Step>;
};
