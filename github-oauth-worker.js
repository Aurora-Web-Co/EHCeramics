export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${url.origin}/callback`,
        scope: "repo,user",
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params}`,
        302
      );
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Missing code", { status: 400 });
      }

      const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${url.origin}/callback`,
        }),
      });

      const data = await res.json();

      if (data.error || !data.access_token) {
        return new Response(
          `Auth failed: ${data.error_description || data.error}`,
          { status: 400 }
        );
      }

      const token = data.access_token;
      const html = `<!DOCTYPE html>
<html>
<body>
<p>Authenticating...</p>
<script>
  (function() {
    var token = "${token}";
    var msg = 'authorization:github:success:' + JSON.stringify({ token: token, provider: 'github' });
    if (!window.opener) {
      document.body.innerHTML = '<p>Error: opener window not found. Close this and try again.</p>';
      return;
    }
    try {
      window.opener.postMessage(msg, '*');
    } catch(e) {
      document.body.innerHTML = '<p>Error sending message: ' + e.message + '</p>';
      return;
    }
    setTimeout(function() { window.close(); }, 500);
  })();
<\/script>
</body>
</html>`;

      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
