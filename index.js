const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const { upload } = require("./s3");
const { s3Url } = require("./config.json");

const { getImages, saveImage } = require("./queries");

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
    console.log("something");
    getImages().then(results => {
        res.json(results);
    });
});

app.post("/upload", uploader.single("file"), upload, function(req, res) {
    // If nothing went wrong the file is already in the uploads directory
    const imgUrl = s3Url + req.file.filename;
    const data = {
        url: imgUrl,
        username: req.body.username,
        title: req.body.title,
        description: req.body.desc
    };

    saveImage(data)
        .then(results => {
            console.log("savedDB", results);
            res.json(results);
        })
        .catch(err => {
            console.log(err.message);
        });

    // if (req.file) {
    //     res.json({
    //         sucess:true
    //     });
    // } else {
    //     res.json({
    //         success: false
    //     });
    // }
});

app.listen(8080, () => console.log("listening on 8080"));
