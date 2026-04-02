const axios = require('axios');
module.exports = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&scope=repo,user`);
  }
  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', 
      { client_id: process.env.OAUTH_CLIENT_ID, client_secret: process.env.OAUTH_CLIENT_SECRET, code },
      { headers: { Accept: 'application/json' } }
    );
    const token = response.data.access_token;
    const content = `<html><body><script>(function(){function r(e){window.opener.postMessage("authorization:github:success:${JSON.stringify({token:token,provider:'github'})}",e.origin)}window.addEventListener("message",r,false);window.opener.postMessage("authorizing:github","*")})()</script></body></html>`;
    res.setHeader('Content-Type', 'text/html');
    return res.send(content);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
