import { ComponentProps, ReactNode } from "react";
import { SegmentedControl, Stack, Text } from "@mantine/core";

export const SegmentedControlLabelled = ({
    label,
    ...segmentedControlProps
}: { label: string } & ComponentProps<typeof SegmentedControl>): ReactNode => {
    return (
        <Stack gap={0}>
            <Text size="sm" mb={3}>
                {label}
            </Text>
            <SegmentedControl {...segmentedControlProps} />
        </Stack>
    );
};
