// Password-protects the CMS. Runs on Netlify's edge before any /admin file is served.
// Credentials come from the ADMIN_USER and ADMIN_PASSWORD environment variables in Netlify.

const encoder = new TextEncoder();

// Hash both values first so the comparison takes the same time regardless of where they differ
async function safeEqual(a, b) {
    const [hashA, hashB] = await Promise.all([
        crypto.subtle.digest("SHA-256", encoder.encode(a)),
        crypto.subtle.digest("SHA-256", encoder.encode(b)),
    ]);
    const viewA = new Uint8Array(hashA);
    const viewB = new Uint8Array(hashB);
    let diff = 0;
    for (let i = 0; i < viewA.length; i++) diff |= viewA[i] ^ viewB[i];
    return diff === 0;
}

function unauthorized() {
    return new Response("Authentication required", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="EH Ceramics CMS", charset="UTF-8"',
            "Cache-Control": "no-store",
        },
    });
}

export default async (request, context) => {
    const expectedUser = Netlify.env.get("ADMIN_USER");
    const expectedPassword = Netlify.env.get("ADMIN_PASSWORD");

    // Fail closed: if the credentials haven't been configured, nobody gets in
    if (!expectedUser || !expectedPassword) {
        return new Response("CMS access is not configured", { status: 503 });
    }

    const header = request.headers.get("authorization") || "";
    if (!header.startsWith("Basic ")) return unauthorized();

    let decoded;
    try {
        decoded = new TextDecoder().decode(
            Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0))
        );
    } catch {
        return unauthorized();
    }

    const separator = decoded.indexOf(":");
    if (separator === -1) return unauthorized();

    const user = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);

    const [userOk, passwordOk] = await Promise.all([
        safeEqual(user, expectedUser),
        safeEqual(password, expectedPassword),
    ]);
    if (!userOk || !passwordOk) return unauthorized();

    const response = await context.next();
    response.headers.set("Cache-Control", "no-store");
    return response;
};

export const config = {
    path: ["/admin", "/admin/*"],
};
