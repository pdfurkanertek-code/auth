module.exports = async (req, res) => {
  const { code } = req.query;

  // 1. Adım: Eğer 'code' yoksa GitHub'a yönlendir
  if (!code) {
    return res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&scope=repo,user`);
  }

  // 2. Adım: GitHub'dan token al
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code
      })
    });

    const data = await response.json();
    
    // 3. Adım: Anahtarı panele fırlat ve pencereyi kapat
    const content = `
    <html>
    <body>
      <script>
        (function() {
          const message = "authorization:github:success:" + JSON.stringify({
            token: "${data.access_token}",
            provider: "github"
          });
          window.opener.postMessage(message, "*");
          window.close();
        })()
      </script>
      <p>Yetkilendirme tamamlandı, yönlendiriliyorsunuz...</p>
    </body>
    </html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(content);

  } catch (e) {
    res.status(500).send("Hata: " + e.message);
  }
};
