const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const { upload } = require("./s3");
const { s3Url } = require("./config.json");

const { getAllImages, saveImage, getImage } = require("./queries");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.get("/images", (req, res) => {
    getAllImages().then(results => {
        res.json(results);
    });
});

app.get("/image", (req, res) => {
    getImage(req.query.id).then(results => {
        res.json(results);
    });
});

app.post("/upload", uploader.single("file"), upload, function(req, res) {
    const imgUrl = s3Url + req.file.filename;
    const data = {
        url: imgUrl,
        username: req.body.username,
        title: req.body.title,
        description: req.body.desc
    };

    saveImage(data)
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            console.log(err.message);
        });
});

app.listen(8080, () => console.log("listening on 8080"));
