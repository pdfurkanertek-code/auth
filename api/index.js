module.exports = async (req, res) => {
  const { code } = req.query;

  // 1. Adım: Eğer 'code' yoksa GitHub'a gönder
  if (!code) {
    return res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&scope=repo,user`);
  }

  // 2. Adım: GitHub'dan token iste (Fetch ile - kütüphane gerektirmez)
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code
      })
    });

    const data = await response.json();
    const token = data.access_token;

    // 3. Adım: Paneli içeri sokacak sihirli mesaj
    const content = `
    <html><body><script>
      (function() {
        function r(e) {
          window.opener.postMessage(
            "authorization:github:success:${JSON.stringify({token: token, provider: 'github'})}",
            e.origin
          );
        }
        window.addEventListener("message", r, false);
        window.opener.postMessage("authorizing:github", "*");
      })()
    </script></body></html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(content);

  } catch (e) {
    res.status(500).json({ error: "Hata oluştu", message: e.message });
  }
};
