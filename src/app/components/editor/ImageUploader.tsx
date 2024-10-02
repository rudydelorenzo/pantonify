import { ComponentProps, ReactNode, useState } from "react";
import { Alert, FileInput, Loader } from "@mantine/core";
import { blobToURI } from "@/app/helpers";
import { useConfigStore } from "@/app/stores/config";

export const ImageUploader = ({
    fileInputProps,
}: {
    fileInputProps?: ComponentProps<typeof FileInput>;
}): ReactNode => {
    const { setImage } = useConfigStore();
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    const handleFileChange = async (payload: File | File[] | null) => {
        if (Array.isArray(payload)) {
            setError("Please select one image!");
            return;
        }
        if (payload) {
            setError(null);
            setUploading(true);
            await setImage((await blobToURI(payload)) || null);
            setUploading(false);
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
                label={"Upload image"}
                placeholder={"Pick an image..."}
                onChange={handleFileChange}
                disabled={uploading}
                accept={"image/png,image/jpeg"}
                leftSection={uploading ? <Loader size={"sm"} /> : undefined}
                {...fileInputProps}
            />
        </>
    );
};
