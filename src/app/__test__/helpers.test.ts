import { describe, expect, it } from "vitest";
import { getPixelSizeFromPPI } from "@/app/helpers";
import { UNITS } from "@/app/constants";

describe("getPixelSizeFromPPI", () => {
    it("should calculate correctly (cm)", () => {
        const pixelSize = getPixelSizeFromPPI(
            { w: 50, h: 70, units: UNITS.cm },
            300,
        );
        expect(pixelSize.h).toBe(8268);
        expect(pixelSize.w).toBe(5906);
    });
    it("should calculate correctly (in)", () => {
        const pixelSize = getPixelSizeFromPPI(
            { w: 20, h: 30, units: UNITS.in },
            300,
        );
        expect(pixelSize.h).toBe(9000);
        expect(pixelSize.w).toBe(6000);
    });
});
