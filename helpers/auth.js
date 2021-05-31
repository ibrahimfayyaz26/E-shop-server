const expressJwt = require("express-jwt");

function authJwt() {
  const secret = process.env.DBPASSWORD;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/api\/26\/Product(.*)/, method: ["GET", "OPTIONS"] },
      { url: /\/api\/26\/Category(.*)/, method: ["GET", "OPTIONS"] },
      { url: /\/public\/uploads(.*)/, method: ["GET", "OPTIONS"] },
      "/api/26/User/login",
      "/api/26/User/register",
    ],
  });
}

async function isRevoked(req, payload, done) {
  if (!payload.admin) {
    done(null, true);
  }
  done();
}

module.exports = authJwt;
