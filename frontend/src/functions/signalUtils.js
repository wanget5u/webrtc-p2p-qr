import pako from "pako";

export const compressSignal = (str) => {
    try {
        const compressed = pako.deflate(str);
        return btoa(String.fromCharCode(...compressed));
    }
    catch (error) {
        console.error("compressSignal error:", error);
        return "";
    }
};

export const decompressSignal = (b64) => {
    try {
        const binary = atob(b64);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        return pako.inflate(bytes, { to: "string" });
    }
    catch (error) {
        console.error("decompressSignal error:", error);
        return "";
    }
};

export const extractSdpFromUrl = (text) => {
    try {
        const url = new URL(text);
        return url.searchParams.get("sdp") || text;
    }
    catch (error) {
        return text;
    }
};

export const generateShareUrl = (localSignal) => {
    if (!localSignal) return "";
    const compressed = compressSignal(localSignal);
    const encoded = encodeURIComponent(compressed);
    return `${window.location.origin}?sdp=${encoded}`;
};