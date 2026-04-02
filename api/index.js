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

    const content = `
    <html>
    <head><title>Giriş Onayı</title></head>
    <body style="text-align:center; font-family:sans-serif; padding-top:50px;">
      <h2>Giriş Başarılı!</h2>
      <p id="status">Ana pencereye bağlanılıyor...</p>
      <button id="manualBtn" style="display:none; padding:10px 20px; background:#24292e; color:white; border:none; border-radius:5px;">
        Panele Dönmek İçin Buraya Tıkla
      </button>

      <script>
        (function() {
          const token = "${token}";
          const message = "authorization:github:success:" + JSON.stringify({token: token, provider: "github"});
          
          function sendAndClose() {
            if (window.opener) {
              // 1. Önce "buradayım" de
              window.opener.postMessage("authorizing:github", "*");
              // 2. Anahtarı teslim et
              window.opener.postMessage(message, "*");
              document.getElementById("status").innerText = "Anahtar teslim edildi! Kapatılıyor...";
              setTimeout(() => { window.close(); }, 1500);
            } else {
              document.getElementById("status").style.color = "red";
              document.getElementById("status").innerText = "Hata: Ana sayfa ile bağlantı kurulamadı.";
              document.getElementById("manualBtn").style.display = "inline-block";
            }
          }

          // Tabletin yavaşlığına karşı 1 saniye bekleyip gönder
          setTimeout(sendAndClose, 1000);

          document.getElementById("manualBtn").onclick = sendAndClose;
        })()
      </script>
    </body>
    </html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(content);

  } catch (e) {
    res.status(500).send("Hata: " + e.message);
  }
};
