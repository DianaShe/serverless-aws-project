const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRET;

const verifyToken = async (event) => {
    
  try {
    const clientToken =
      event.headers.authorization || event.authorizationToken;

    let token
    // const token = clientToken.startsWith("Bearer")
    //   ? clientToken.split(" ")[1]
    //   : clientToken;

    if (clientToken.startsWith("Bearer")) {
      token = clientToken.split(" ")[1]
    } else {
      token = clientToken
    }

      let response = {
        isAuthorized: false,
      };

    
    const payload = jwt.verify(token, SECRET);

    if (payload.email) {
      response = {
        isAuthorized: true,
        context: {
            stringKey: JSON.stringify(payload.email)
        }
      };
    }

    return response;
  } catch (error) {
    return {
        isAuthorized: false,
      };
  }
};

module.exports.handler = verifyToken;
