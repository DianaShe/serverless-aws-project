const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const HttpError = require("../../utils/httpError");
const userService = require("../../services/userService");
const funcWrapper = require("../../utils/funcWrapper");

const SECRET = process.env.SECRET;

const signIn = funcWrapper(async (event) => {
  const body = JSON.parse(event.body || "{}");
  const { email, password } = body;

  if (!email || !password) {
    throw HttpError(400, 'Please, provide "email" and "password"');
  }

  if (email === "" || password === "") {
    throw HttpError(400, '"email" and "password" cannot be empty strings');
  }

  const item = await userService.findUser(email);
  if (!item) {
    throw HttpError(404, "Email or password is incorrect");
  }
  const { userId, password: hashPassword } = item;
  const passwordIsValid = await bcrypt.compare(password, hashPassword);
  if (!passwordIsValid) {
    throw HttpError(404, "Email or password is incorrect");
  }
  const accessToken = jwt.sign({ email }, SECRET, { expiresIn: "2h" });

  await userService.updateToken(email, accessToken);

  return {
    statusCode: 200,
    body: JSON.stringify({ userId, accessToken }),
  };
});

module.exports.handler = signIn;
