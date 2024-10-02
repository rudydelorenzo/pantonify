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
import { ImageUploader } from "@/app/components/Editor/ImageUploader";
import { useConfigStore } from "@/app/stores/config";

const STEPS = 4;

export default function Home() {
    const { imageUrl } = useConfigStore();
    const [active, setActive] = useState(0);
    const nextStep = () =>
        setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () =>
        setActive((current) => (current > 0 ? current - 1 : current));
    const [nextButtonDisabled, setNextButtonDisabled] = useState<boolean>(true);

    useEffect(() => {
        if (active === 0) {
            if (imageUrl !== "") setNextButtonDisabled(false);
            else setNextButtonDisabled(true);
        } else if (active === 1) {
        } else if (active === 2) {
        }
    }, [active, imageUrl]);

    return (
        <Center mih={"100vh"} miw={"100%"}>
            <Stack miw={"100%"}>
                <Center>
                    <Stepper
                        active={active}
                        onStepClick={setActive}
                        miw={"80%"}
                        maw={"90%"}
                    >
                        <Stepper.Step
                            label="Image"
                            description="Upload your image"
                        >
                            <Center>
                                <Stack w={"50%"}>
                                    <Text>First choose your image</Text>
                                    {imageUrl && (
                                        <Image
                                            src={imageUrl}
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
                        </Stepper.Step>
                        <Stepper.Step
                            label="Size"
                            description="Select your print size"
                        >
                            <Center>
                                Now select your print size (don't worry, you'll
                                be able to change this later)
                            </Center>
                        </Stepper.Step>
                        <Stepper.Step
                            label="Edit"
                            description="Fine tune your art"
                        >
                            Step 3 content: Get full access
                        </Stepper.Step>
                        <Stepper.Completed>
                            <Center>
                                <Editor />
                            </Center>
                        </Stepper.Completed>
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
