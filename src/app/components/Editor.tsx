import { ReactNode, useRef } from "react";
import { Accordion, Center, Flex, Stack, Title } from "@mantine/core";
import { ArtDisplay } from "@/app/components/ArtDisplay";
import { MarginSelector } from "@/app/components/editor/MarginSelector";
import { UnitSelector } from "@/app/components/editor/UnitSelector";
import { OrientationSelector } from "@/app/components/editor/OrientationSelector";
import { PrintSizeSelector } from "@/app/components/editor/PrintSizeSelector";
import { EstimatedFilesizeDisplay } from "@/app/components/editor/EstimatedFilesizeDisplay";
import { ExportButton } from "@/app/components/editor/ExportButton";
import { ConfigTextInput } from "@/app/components/editor/ConfigTextInput";

export const Editor = (): ReactNode => {
    const svgCanvasElement = useRef<SVGSVGElement | null>(null);

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
                    <ConfigTextInput
                        property={"topText"}
                        setter={"setTopText"}
                        inputProps={{
                            label: "Title",
                            placeholder: "PANTONE",
                        }}
                    />
                    <ConfigTextInput
                        property={"bottomText"}
                        setter={"setBottomText"}
                        inputProps={{
                            label: "Subtitle",
                            placeholder: "Sub Title",
                        }}
                    />
                    <ConfigTextInput
                        property={"dateText"}
                        setter={"setDateText"}
                        inputProps={{
                            label: "Date",
                            placeholder: "2024",
                        }}
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
                    <ExportButton svgCanvasElementRef={svgCanvasElement} />
                    <EstimatedFilesizeDisplay />
                </Stack>
            </Center>
        </Flex>
    );
};
