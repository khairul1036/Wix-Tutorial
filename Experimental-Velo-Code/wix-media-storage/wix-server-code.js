// backend/http-function.js

// ========================
// Wix Media Storage Example

// POST: https:yourdomain.com/my-site-2/_functions/upload
// GET: https:yourdomain.com/my-site-2/_functions/files

// ========================


import { mediaManager } from "wix-media-backend";
import { ok, badRequest, serverError } from "wix-http-functions";

// ========================
// Helper: JSON + FULL CORS
// ========================
function jsonResponse(statusFn, data) {
    return statusFn({
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
        body: JSON.stringify(data)
    });
}

// ========================
// OPTIONS /_functions/upload  ✅ MUST MATCH NAME
// ========================
export function options_upload() {
    return ok({
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
    });
}

// ========================
// POST /_functions/upload
// ========================
export async function post_upload(request) {
    try {
        const body = await request.body.json();
        const { fileName, base64, mimeType } = body;

        if (!fileName || !base64 || !mimeType) {
            return jsonResponse(badRequest, {
                message: "fileName, base64 & mimeType required"
            });
        }

        const buffer = Buffer.from(
            base64.replace(/^data:.*;base64,/, ""),
            "base64"
        );

        // ✅ Upload to root (no folder)
        const uploadResult = await mediaManager.upload(
            "", // empty string means root
            buffer,
            fileName, {
            mediaOptions: { mimeType },
            metadataOptions: { isPrivate: false }
        }
        );

        // Convert wix:image:// → direct CDN URL
        const wixUrl = uploadResult.fileUrl;
        const match = wixUrl.match(/\/([^\/]+~mv2\.[a-z0-9]+)/i);
        const mediaFile = match ? match[1] : null;

        const publicUrl = mediaFile ?
            `https://static.wixstatic.com/media/${mediaFile}` :
            null;

        return jsonResponse(ok, {
            success: true,
            publicUrl, // ✅ Direct CDN link
            wixInternalUrl: wixUrl,
            mediaId: uploadResult.mediaType
        });

    } catch (err) {
        return jsonResponse(serverError, {
            success: false,
            error: err.message
        });
    }
}

// ========================
// GET /_functions/files
// ========================
export async function get_files() {
    try {
        const filesList = await mediaManager.listFiles();

        const files = filesList.map(file => {
            const wixUrl = file.fileUrl;

            const match = wixUrl.match(/\/([^\/]+~mv2\.[a-z0-9]+)/i);
            const mediaFile = match ? match[1] : null;

            return {
                fileName: file.fileName,
                mimeType: file.mimeType,
                wixInternalUrl: wixUrl,
                publicUrl: mediaFile ?
                    `https://static.wixstatic.com/media/${mediaFile}` : null,
                createdDate: file._createdDate
            };
        });

        return jsonResponse(ok, {
            success: true,
            total: files.length,
            files
        });

    } catch (err) {
        return jsonResponse(serverError, {
            success: false,
            error: err.message
        });
    }
}
