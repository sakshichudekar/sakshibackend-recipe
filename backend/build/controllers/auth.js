"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const model_1 = require("../model");
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIN,
    });
};
const registerOrLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const _user = yield model_1.User.findOne({ email }).select("+password").exec();
        if (_user) {
            if (!(yield bcryptjs_1.default.compare(password, _user === null || _user === void 0 ? void 0 : _user.password))) {
                return res.status(400).json({ error: "Invalid email or password" });
            }
            const token = signToken(_user === null || _user === void 0 ? void 0 : _user._id);
            return res.status(200).json({ token, email, id: _user === null || _user === void 0 ? void 0 : _user._id });
        }
        const newUser = yield model_1.User.create({
            email,
            password: yield bcryptjs_1.default.hash(password, 12 /* CONSTANTS.SALT */),
        });
        const token = signToken(newUser === null || newUser === void 0 ? void 0 : newUser._id);
        return res
            .status(201)
            .json({ token, email: newUser === null || newUser === void 0 ? void 0 : newUser.email, id: newUser._id });
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ error: "An error occured while processing your request" });
    }
});
exports.registerOrLogin = registerOrLogin;
