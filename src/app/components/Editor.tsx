import { ChangeEvent, ReactNode, useRef, useState } from "react";
import { useConfigStore } from "@/app/stores/config";
import { exportAndSaveImage } from "@/app/helpers";
import {
    Accordion,
    Button,
    Center,
    Flex,
    Group,
    Loader,
    Stack,
    TextInput,
    Title,
    Text,
} from "@mantine/core";
import { ArtDisplay } from "@/app/components/ArtDisplay";
import { MarginSelector } from "@/app/components/editor/MarginSelector";
import { UnitSelector } from "@/app/components/editor/UnitSelector";
import { OrientationSelector } from "@/app/components/editor/OrientationSelector";
import { PrintSizeSelector } from "@/app/components/editor/PrintSizeSelector";

export const Editor = (): ReactNode => {
    const {
        topText,
        bottomText,
        dateText,
        setTopText,
        setBottomText,
        setDateText,
    } = useConfigStore();
    const [exportInProgress, setExportInProgress] = useState<boolean>(false);

    const svgCanvasElement = useRef<SVGSVGElement | null>(null);

    const handleTopTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTopText(event.target.value);
    };
    const handleBottomTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        setBottomText(event.target.value);
    };
    const handleDateTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        setDateText(event.target.value);
    };

    const handleRenderImage = async () => {
        setExportInProgress(true);
        await exportAndSaveImage(
            `EXPORT_${topText}_${bottomText}.png`,
            svgCanvasElement,
        );
        setExportInProgress(false);
    };

    return (
        <Flex align={"center"} gap={"5rem"}>
            <div style={{ height: "100%" }}>
                <Center mih={"100%"}>
                    <ArtDisplay svgRef={svgCanvasElement} />
                </Center>
            </div>
            <Center>
                <Stack>
                    <Center>
                        <Title>🌄 Pantonify</Title>
                    </Center>
                    <TextInput
                        label={"Title"}
                        value={topText}
                        placeholder={"Pantone"}
                        onChange={handleTopTextChange}
                    />
                    <TextInput
                        label={"Subtitle"}
                        value={bottomText}
                        placeholder={"Sub Title"}
                        onChange={handleBottomTextChange}
                    />
                    <TextInput
                        label={"Date"}
                        value={dateText}
                        placeholder={"Date text"}
                        onChange={handleDateTextChange}
                    />
                    <MarginSelector />
                    <Accordion>
                        <Accordion.Item value={"More settings"}>
                            <Accordion.Control icon={"+"}>
                                Project settings
                            </Accordion.Control>
                            <Accordion.Panel>
                                <UnitSelector />
                                <OrientationSelector />
                                <PrintSizeSelector />
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                    <Button
                        onClick={handleRenderImage}
                        disabled={exportInProgress}
                    >
                        {!exportInProgress ? (
                            "Export as PNG..."
                        ) : (
                            <Group align={"center"} gap={"lg"}>
                                <Text c={"white"}>Exporting</Text>
                                <Loader
                                    type={"dots"}
                                    color={"white"}
                                    size={"sm"}
                                />
                            </Group>
                        )}
                    </Button>
                </Stack>
            </Center>
        </Flex>
    );
};
