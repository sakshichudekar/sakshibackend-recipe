"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = exports.recipeRouter = void 0;
const recipes_1 = require("./recipes");
Object.defineProperty(exports, "recipeRouter", { enumerable: true, get: function () { return recipes_1.router; } });
const auth_1 = require("./auth");
Object.defineProperty(exports, "authRouter", { enumerable: true, get: function () { return auth_1.router; } });
