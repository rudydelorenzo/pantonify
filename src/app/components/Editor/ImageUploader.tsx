import { ComponentProps, ReactNode, useState } from "react";
import { Alert, FileInput } from "@mantine/core";
import { blobToURI } from "@/app/helpers";
import { useConfigStore } from "@/app/stores/config";

export const ImageUploader = ({
    fileInputProps,
}: {
    fileInputProps?: ComponentProps<typeof FileInput>;
}): ReactNode => {
    const { setImageUrl } = useConfigStore();
    const [error, setError] = useState<string | null>(null);
    const handleFileChange = async (payload: File | File[] | null) => {
        if (Array.isArray(payload)) {
            setError("Please select one image!");
            return;
        }
        if (payload) {
            setError(null);
            setImageUrl((await blobToURI(payload)) || "");
        }
    };
    return (
        <>
            {error && (
                <Alert variant="light" color={"red"}>
                    {error}
                </Alert>
            )}
            <FileInput
                label={"Image"}
                placeholder={"Pick an image..."}
                onChange={handleFileChange}
                {...fileInputProps}
            />
        </>
    );
};
