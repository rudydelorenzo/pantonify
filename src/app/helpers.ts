export const blobToURI = async (
    blob: Blob | undefined,
): Promise<string | undefined> => {
    if (!blob) return undefined;
    const dataUri = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
    return typeof dataUri === "string" ? dataUri : undefined;
};
