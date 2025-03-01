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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecipe = exports.getUserRecipes = exports.getRecipe = exports.getAllRecipes = exports.searchRecipe = void 0;
const model_1 = require("../model");
const utils_1 = require("../utils");
const cloudinary_1 = require("../cloudinary");
const searchRecipe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { q } = req.query;
    try {
        const pipeline = [
            {
                $search: {
                    index: "recipe",
                    text: {
                        query: q,
                        path: {
                            wildcard: "*",
                        },
                        fuzzy: {},
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $project: {
                    user: 1,
                    note: 1,
                    description: 1,
                    title: 1,
                    ingredients: 1,
                    image: 1,
                },
            },
        ];
        const recipes = yield model_1.Recipe.aggregate(pipeline)
            .sort({ _id: -1 })
            .exec();
        let response = [];
        if (!!(recipes === null || recipes === void 0 ? void 0 : recipes.length)) {
            //extract the user email from the user array from the result
            response = recipes.map((recipe) => {
                const { user } = recipe, rest = __rest(recipe, ["user"]);
                const email = user[0].email;
                //form the new data
                return Object.assign(Object.assign({}, rest), { user: email });
            });
        }
        res.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "An error occured while processing your request" });
    }
});
exports.searchRecipe = searchRecipe;
const getAllRecipes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recipes = yield model_1.Recipe.find({})
            .populate("user", "email")
            .sort({ _id: -1 })
            .exec();
        res.status(200).json(recipes);
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "An error occured while processing your request" });
    }
});
exports.getAllRecipes = getAllRecipes;
const getRecipe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const recipe = yield model_1.Recipe.findById(id).populate("user", "email").exec();
        res.status(200).json(recipe);
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "An error occured while processing your request" });
    }
});
exports.getRecipe = getRecipe;
const getUserRecipes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const recipe = yield model_1.Recipe.find({ user: userId })
            .populate("user", "email")
            .sort({ _id: -1 })
            .exec();
        res.status(200).json(recipe);
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "An error occured while processing your request" });
    }
});
exports.getUserRecipes = getUserRecipes;
const createRecipe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(req === null || req === void 0 ? void 0 : req.user)) {
        return res.status(422).json({ error: "Unable to process your request." });
    }
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: "No files were uploaded." });
    }
    const image = req.files.image;
    if (!(0, utils_1.validateImageType)(image)) {
        return res.status(422).json({ error: "Image type not supported." });
    }
    //if you wan to store to disk, you use this
    // const fileName = Date.now() + image.name;
    // const pathToFIle = path.resolve(
    //   __dirname + "../../../assets/" + Date.now() + image.name
    // );
    // image.mv(pathToFIle, (err) => {
    //   if (err) {
    //     return res.status(500).json({ error: err?.error });
    //   }
    // });
    //calling cloudinary
    let imageUrl;
    let imageId;
    try {
        const res = yield (0, cloudinary_1.upload)(image.data, "Images");
        imageUrl = res.secure_url;
        imageId = res.public_id;
    }
    catch (error) {
        console.log(error, "CLOUDINARY ERROR");
        return res.status(400).json({ error: error === null || error === void 0 ? void 0 : error.error });
    }
    const { title, note, description, ingredients, } = req.body;
    try {
        const recipe = yield model_1.Recipe.create({
            user: req.user,
            title,
            note,
            description,
            ingredients,
            image: {
                url: imageUrl,
                id: imageId,
            },
        });
        return res.status(200).json(Object.assign({ message: "created successfully" }, recipe));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ error: "An error occured while processing your request" });
    }
});
exports.createRecipe = createRecipe;
