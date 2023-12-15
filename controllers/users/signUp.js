const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userService = require("../../services/userService");
const HttpError = require("../../utils/httpError");
const funcWrapper = require("../../utils/funcWrapper");

const SECRET = process.env.SECRET;

const signUp = funcWrapper(async (event) => {
  const body = JSON.parse(event.body || "{}");
  const { email, password } = body;
  const userId = nanoid(10);

  if (!email || !password) {
    throw HttpError(400, 'Please, provide "email" and "password"');
  }

  if (email === "" || password === "") {
    throw HttpError(400, '"email" and "password" cannot be empty strings');
  }

  if (password.length < 8 || password.length > 16) {
    throw HttpError(400, "password should be from 8 to 16 characters long");
  }

  if (!email.includes("@") && !email.includes(".")) {
    throw HttpError(400, "Enter a valid email address");
  }

  const accessToken = jwt.sign({ email }, SECRET, { expiresIn: "2h" });
  const hashPassword = await bcrypt.hash(password, 10);

  const result = await userService.addUser(
    email,
    userId,
    accessToken,
    hashPassword
  );

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
});

module.exports.handler = signUp;
