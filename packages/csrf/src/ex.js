import { generateTokenBuf, verifyToken } from "./token.js";

const secret = "secret";
const token = generateTokenBuf(secret);
verifyToken(Buffer.from(token, "hex"), secret);
