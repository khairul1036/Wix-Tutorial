// ========================
// /backend/http-functions.js
// 
// End points: https://<your-site>.wixsite.com/_functions/submissions
// 
// CRUD operations on "Submissions" collection  

// Frontend URL live link: https://taupe-sable-081072.netlify.app
// ========================

import { ok, notFound, serverError, badRequest } from "wix-http-functions";
import wixData from "wix-data";

// Allowed origins for CORS (frontend URL)
// const ALLOWED_ORIGINS = ["http://127.0.0.1:5500"]; // change this to your frontend
const ALLOWED_ORIGINS = ["https://taupe-sable-081072.netlify.app", "http://127.0.0.1:5500"]; // change this to your frontend

// Helper: JSON + CORS response
function jsonResponse(statusFn, data, origin) {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    return statusFn({ headers, body: JSON.stringify(data) });
}

// ========================
// OPTIONS preflight handler (for CORS)
// ========================
export function options_submissions(request) {
    const origin = request.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        return ok({
            headers: {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        });
    }
    return ok({ headers: { "Access-Control-Allow-Origin": "*" } });
}

// ========================
// GET: All or by ID
// ========================
export function get_submissions(request) {
    const origin = request.headers.origin;
    if (request.path.length > 0 && request.path[0]) {
        const id = request.path[0];
        return wixData.get("Submissions", id)
            .then((item) => item ?
                jsonResponse(ok, { item }, origin) :
                jsonResponse(notFound, { error: `Item with ID '${id}' not found` }, origin)
            )
            .catch((error) => jsonResponse(serverError, { error: error.message }, origin));
    }

    return wixData.query("Submissions")
        .find()
        .then((results) => jsonResponse(ok, { items: results.items }, origin))
        .catch((error) => jsonResponse(serverError, { error: error.message }, origin));
}

// ========================
// POST: Create new submission
// ========================
export async function post_submissions(request) {
    const origin = request.headers.origin;
    try {
        const body = await request.body.json();
        const result = await wixData.insert("Submissions", body);
        return jsonResponse(ok, { success: true, item: result }, origin);
    } catch (error) {
        return jsonResponse(badRequest, { error: error.message }, origin);
    }
}

// ========================
// PUT: Update submission by ID
// ========================
export async function put_submissions(request) {
    const origin = request.headers.origin;
    const id = request.path[0];
    if (!id) return jsonResponse(badRequest, { error: "Missing ID in path" }, origin);

    try {
        const body = await request.body.json();
        body._id = id;
        const updated = await wixData.update("Submissions", body);
        return jsonResponse(ok, { success: true, item: updated }, origin);
    } catch (error) {
        return jsonResponse(badRequest, { error: error.message }, origin);
    }
}

// ========================
// DELETE: Remove submission by ID
// ========================
export function delete_submissions(request) {
    const origin = request.headers.origin;
    const id = request.path[0];
    if (!id) return jsonResponse(badRequest, { error: "Missing ID in path" }, origin);

    return wixData.remove("Submissions", id)
        .then(() => jsonResponse(ok, { success: true, message: "Deleted successfully" }, origin))
        .catch((error) => jsonResponse(badRequest, { error: error.message }, origin));
}

// ========================
// GET: Search submissions by name or companyName
// ========================
export function get_submissions_search(request) {
    const origin = request.headers.origin;
    const queryValue = request.query?.query;
    if (!queryValue) return jsonResponse(badRequest, { error: "Missing ?query parameter" }, origin);

    return wixData.query("Submissions")
        .contains("name", queryValue)
        .or(wixData.query("Submissions").contains("companyName", queryValue))
        .find()
        .then((results) => jsonResponse(ok, { items: results.items }, origin))
        .catch((error) => jsonResponse(serverError, { error: error.message }, origin));
}

// // =======================================================
// // ================ cors not oky but all ok =========================
// import { ok, notFound, serverError, badRequest } from "wix-http-functions";
// import wixData from "wix-data";

// // Helper: JSON response
// function jsonResponse(statusFn, data) {
//     return statusFn({
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data)
//     });
// }

// // ========================
// // GET: All or by ID
// // ========================
// export function get_submissions(request) {
//     let options = { headers: { "Content-Type": "application/json" } };

//     // Path parameter present? (GET by ID)
//     if (request.path.length > 0 && request.path[0]) {
//         const id = request.path[0];

//         return wixData.get("Submissions", id)
//             .then((item) => {
//                 if (item) return ok({ ...options, body: JSON.stringify({ item }) });
//                 return notFound({ ...options, body: JSON.stringify({ error: `Item with ID '${id}' not found` }) });
//             })
//             .catch((error) => serverError({ ...options, body: JSON.stringify({ error: error.message }) }));
//     }

//     // No ID -> return all items
//     return wixData.query("Submissions")
//         .find()
//         .then((results) => ok({ ...options, body: JSON.stringify({ items: results.items }) }))
//         .catch((error) => serverError({ ...options, body: JSON.stringify({ error: error.message }) }));
// }

// // ========================
// // POST: Create new submission
// // ========================
// export async function post_submissions(request) {
//     try {
//         const body = await request.body.json();
//         const result = await wixData.insert("Submissions", body);
//         return jsonResponse(ok, { success: true, item: result });
//     } catch (error) {
//         return jsonResponse(badRequest, { error: error.message });
//     }
// }

// // ========================
// // PUT: Update submission by ID
// // ========================
// export async function put_submissions(request) {
//     const id = request.path[0];
//     if (!id) return jsonResponse(badRequest, { error: "Missing ID in path" });

//     try {
//         const body = await request.body.json();
//         body._id = id;
//         const updated = await wixData.update("Submissions", body);
//         return jsonResponse(ok, { success: true, item: updated });
//     } catch (error) {
//         return jsonResponse(badRequest, { error: error.message });
//     }
// }

// // ========================
// // DELETE: Remove submission by ID
// // ========================
// export function delete_submissions(request) {
//     const id = request.path[0];
//     if (!id) return jsonResponse(badRequest, { error: "Missing ID in path" });

//     return wixData.remove("Submissions", id)
//         .then(() => jsonResponse(ok, { success: true, message: "Deleted successfully" }))
//         .catch((error) => jsonResponse(badRequest, { error: error.message }));
// }

// // ========================
// // GET: Search submissions by name or companyName
// // ========================
// export function get_submissions_search(request) {
//     const queryValue = request.query?.query;
//     if (!queryValue) return jsonResponse(badRequest, { error: "Missing ?query parameter" });

//     return wixData.query("Submissions")
//         .contains("name", queryValue)
//         .or(wixData.query("Submissions").contains("companyName", queryValue))
//         .find()
//         .then((results) => jsonResponse(ok, { items: results.items }))
//         .catch((error) => jsonResponse(serverError, { error: error.message }));
// }

//==================================================================
// // ok code
// // // backend/http-functions.js
// // import { ok, serverError } from 'wix-http-functions';

// // export function get_hello(request) {
// //   try {
// //     const query = request.query;
// //     const name = query?.name || "Guest";

// //     const responseBody = {
// //       message: `Hello ${name}! 👋`,
// //       info: "This is a GET API from your Wix site",
// //       url: request.url
// //     };

// //     return ok({
// //       headers: { "Content-Type": "application/json" },
// //       body: responseBody
// //     });
// //   } catch (err) {
// //     return serverError({
// //       body: { error: err.message }
// //     });
// //   }
// // }

// // =====================================================================

// // backend/http-functions.js
// // import { ok, serverError } from 'wix-http-functions';
// // import wixData from 'wix-data';

// // // ✅ GET: /_functions/submissions
// // export async function get_submissions(request) {
// //   try {
// //     // "Submissions" collection থেকে data query করো
// //     const results = await wixData.query("Submissions").find();

// //     // response তৈরি করো
// //     const data = results.items.map(item => ({
// //       _id: item._id,
// //       ...item
// //     }));

// //     return ok({
// //       headers: { "Content-Type": "application/json" },
// //       body: { count: data.length, items: data }
// //     });

// //   } catch (error) {
// //     return serverError({
// //       body: { error: error.message }
// //     });
// //   }
// // }

// // -----------------
// // curd

// import { ok, notFound, serverError, badRequest } from 'wix-http-functions';
// import wixData from 'wix-data';

// // Helper function for JSON responses
// function jsonResponse(statusFn, data) {
//     return statusFn({
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data)
//     });
// }

// // // ✅ Get all submissions
// // export async function get_submissions(request) {
// //     try {
// //         const results = await wixData.query("Submissions").find();
// //         return jsonResponse(ok, { items: results.items });
// //     } catch (error) {
// //         return jsonResponse(serverError, { error: error.message });
// //     }
// // }

// // ✅ Get single submission by ID
// export async function get_submissions_id(request) {
//     const id = request.path[4];
//     try {
//         const item = await wixData.get("Submissions", id);
//         if (!item) return jsonResponse(notFound, { message: "Item not found" });
//         return jsonResponse(ok, item);
//     } catch (error) {
//         return jsonResponse(serverError, { error: error.message });
//     }
// }

// // ✅ Create new submission
// export async function post_submissions(request) {
//     try {
//         const body = await request.body.json();
//         const result = await wixData.insert("Submissions", body);
//         return jsonResponse(ok, { success: true, item: result });
//     } catch (error) {
//         return jsonResponse(badRequest, { error: error.message });
//     }
// }

// // ✅ Update submission
// export async function put_submissions_id(request) {
//     const id = request.path[1];
//     try {
//         const body = await request.body.json();
//         body._id = id;
//         const updated = await wixData.update("Submissions", body);
//         return jsonResponse(ok, { success: true, item: updated });
//     } catch (error) {
//         return jsonResponse(badRequest, { error: error.message });
//     }
// }

// // ✅ Delete submission
// export async function del_submissions_id(request) {
//     const id = request.path[1];
//     try {
//         await wixData.remove("Submissions", id);
//         return jsonResponse(ok, { success: true, message: "Deleted successfully" });
//     } catch (error) {
//         return jsonResponse(badRequest, { error: error.message });
//     }
// }

// // ✅ Search submissions by name or companyName
// export async function get_submissions_search(request) {
//     try {
//         const queryParams = request.query;
//         const queryValue = queryParams.query;

//         if (!queryValue) {
//             return jsonResponse(badRequest, { error: "Missing ?query parameter" });
//         }

//         const results = await wixData.query("Submissions")
//             .contains("name", queryValue)
//             .or(wixData.query("Submissions").contains("companyName", queryValue))
//             .find();

//         return jsonResponse(ok, { items: results.items });
//     } catch (error) {
//         return jsonResponse(serverError, { error: error.message });
//     }
// }

// // ✅ URL Example:
// // https://khairuloffice259.wixsite.com/wix-stores-external/_functions/submissions/db914a8f-b89e-408e-926d-dbd1ca03949b
// export function get_submissions(request) {
//     let options = {
//         headers: {
//             "Content-Type": "application/json",
//         },
//     };

//     // যদি path-এ ID থাকে, তাহলে by ID fetch করবে
//     if (request.path.length > 0 && request.path[0]) {
//         const id = request.path[0];

//         return wixData.get("Submissions", id)
//             .then((item) => {
//                 if (item) {
//                     options.body = { item };
//                     return ok(options);
//                 } else {
//                     options.body = { error: `Item with ID '${id}' not found` };
//                     return notFound(options);
//                 }
//             })
//             .catch((error) => {
//                 options.body = { error: error.message };
//                 return serverError(options);
//             });
//     }

//     // যদি ID না থাকে, সব ডেটা ফেরত দেবে
//     return wixData.query("Submissions")
//         .find()
//         .then((results) => {
//             options.body = { items: results.items };
//             return ok(options);
//         })
//         .catch((error) => {
//             options.body = { error: error.message };
//             return serverError(options);
//         });
// }