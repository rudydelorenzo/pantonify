"use client";

import { useEffect, useState } from "react";
import {
    Button,
    Center,
    Stack,
    Text,
    Stepper,
    Group,
    Image,
} from "@mantine/core";
import { Editor } from "@/app/components/Editor";
import { ImageUploader } from "@/app/components/editor/ImageUploader";
import { useConfigStore } from "@/app/stores/config";
import { PrintSizeSelector } from "@/app/components/editor/PrintSizeSelector";
import { useCanvasStore } from "@/app/stores/canvas";
import { UnitSelector } from "@/app/components/editor/UnitSelector";
import { OrientationSelector } from "@/app/components/editor/OrientationSelector";
import { CustomStep } from "@/app/components/CustomStep";

const STEPS = 3;

export default function Home() {
    const { printSize } = useCanvasStore();
    const { image } = useConfigStore();
    const [active, setActive] = useState(0);
    const nextStep = () =>
        setActive((current) => (current < STEPS - 1 ? current + 1 : current));
    const prevStep = () =>
        setActive((current) => (current > 0 ? current - 1 : current));
    const [nextButtonDisabled, setNextButtonDisabled] = useState<boolean>(true);

    useEffect(() => {
        if (active === 0) {
            if (!image) setNextButtonDisabled(true);
            else setNextButtonDisabled(false);
        } else if (active === 1) {
            if (!printSize) setNextButtonDisabled(true);
            else setNextButtonDisabled(false);
        } else if (active === 2) {
            setNextButtonDisabled(true);
        }
    }, [active, image, printSize]);

    return (
        <Center mih={"100vh"} miw={"100%"}>
            <Stack miw={"100%"}>
                <Center>
                    <Stepper
                        active={active}
                        onStepClick={setActive}
                        miw={"80%"}
                        maw={"90%"}
                        allowNextStepsSelect={false}
                    >
                        <CustomStep
                            label="Image"
                            description="Upload your image"
                        >
                            <Center>
                                <Stack w={"50%"}>
                                    <Text ta={"center"}>
                                        First, choose your image
                                    </Text>
                                    {image && (
                                        <Image
                                            src={image.url}
                                            alt={"Image preview"}
                                            fit={"contain"}
                                            mah={"30vh"}
                                        />
                                    )}
                                    <ImageUploader
                                        fileInputProps={{ w: "100%" }}
                                    />
                                </Stack>
                            </Center>
                        </CustomStep>
                        <Stepper.Step
                            label="Dimensions"
                            description="Select your print size and units"
                        >
                            <Center>
                                <Stack w={"50%"}>
                                    <Text ta={"center"}>
                                        {"Next, select your settings (don't worry, " +
                                            "you'll be able to change these later)"}
                                    </Text>
                                    <UnitSelector />
                                    <OrientationSelector />
                                    <PrintSizeSelector />
                                </Stack>
                            </Center>
                        </Stepper.Step>
                        <Stepper.Step
                            label="Edit"
                            description="Fine tune your art"
                        >
                            <Center>
                                <Editor />
                            </Center>
                        </Stepper.Step>
                    </Stepper>
                </Center>

                <Group justify="center" mt="xl">
                    <Button variant="default" onClick={prevStep}>
                        Back
                    </Button>
                    <Button onClick={nextStep} disabled={nextButtonDisabled}>
                        Next step
                    </Button>
                </Group>
            </Stack>
        </Center>
    );
}
