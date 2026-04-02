module.exports = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&scope=repo,user`);
  }

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
    const token = data.access_token;

    if (!token) {
      return res.status(400).send("Hata: GitHub'dan anahtar alınamadı. Lütfen ID ve Secret'ı Vercel'den kontrol edin.");
    }

    const content = `
    <html>
    <head><title>Yetkilendirme Tamam</title></head>
    <body>
      <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
        <h2>Giriş Başarılı!</h2>
        <p>Yönetim paneline dönülüyor, lütfen bekleyin...</p>
      </div>
      <script>
        (function() {
          const message = "authorization:github:success:" + JSON.stringify({
            token: "${token}",
            provider: "github"
          });
          
          // Ana pencereye anahtarı fırlat
          if (window.opener) {
            window.opener.postMessage(message, "*");
            // 500ms bekle ve kapat
            setTimeout(() => { window.close(); }, 500);
          } else {
            // Eğer pencere kapanmazsa kullanıcıyı uyar
            document.body.innerHTML += "<p style='color:red'>Hata: Ana pencere bağlantısı koptu. Lütfen giriş sayfasını yenileyip tekrar deneyin.</p>";
          }
        })()
      </script>
    </body>
    </html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(content);

  } catch (e) {
    res.status(500).send("Sistem Hatası: " + e.message);
  }
};
