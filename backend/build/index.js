"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
//@ts-ignore
const xss_clean_1 = __importDefault(require("xss-clean"));
const routes_1 = require("./routes");
const config_1 = require("./config");
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
//set http headers
app.use((0, helmet_1.default)());
//compress the node application
app.use((0, compression_1.default)());
//serve as a limiter for accessing our api
app.use(apiLimiter);
//clean againt injections
app.use((0, xss_clean_1.default)());
app.use((0, express_fileupload_1.default)({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true,
}));
app.use(passport_1.default.initialize());
// Passport Config
(0, config_1.authenticate)(passport_1.default);
//initialize DB call
const runDB = () => __awaiter(void 0, void 0, void 0, function* () {
    (0, mongoose_1.connect)(process.env.MONGODB_URI)
        .then(() => console.log("DB connected successfully"))
        .catch(() => console.log("DB not connected"));
});
//start DB
runDB();
app.use("/recipe", routes_1.recipeRouter);
app.use("/auth", routes_1.authRouter);
//OPTIONAL (THIS IS JUST FOR HEALTH CHECK MAJORLY)
//added for pinging and health check on render.com
app.get("/ping", (req, res) => {
    res.send("pong");
});
app.all("*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.protocol);
    res.status(404).json({
        error: "The route you requested is not found",
    });
}));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
