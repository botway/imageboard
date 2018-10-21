const express = require("express");
const app = express();
const request = require("request");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const { upload, delImg } = require("./s3");
const { s3Url } = require("./config.json");

const {
    getAllImages,
    getMoreImages,
    saveImage,
    delImage,
    getImage,
    addComment,
    getComments,
    delComments
} = require("./queries");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

const isUrl = function(req, res, next) {
    console.log("fofo", req.body);
    let str = req.body.imgurl;
    if (str.startsWith("http://") || str.startsWith("https://")) {
        download(str, results => {
            req.file = results;
            next();
        });
    } else {
        next();
    }
};

const download = function(url, cb) {
    request.head(url, (err, res, body) => {
        let ext = "." + res.headers["content-type"].split("/")[1];
        let filename = uidSafe.sync(24) + ext;
        let path = __dirname + "/uploads/" + filename;

        const file = {
            filename: filename,
            mimetype: res.headers["content-type"],
            size: res.headers["content-length"],
            path: path
        };
        request(url)
            .pipe(fs.createWriteStream(path))
            .on("close", () => {
                cb(file);
            });
    });
};

app.post("/upload", uploader.single("file"), isUrl, upload, function(req, res) {
    console.log(req.body, req.file);
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

app.get("/images/", (req, res) => {
    getAllImages(req.query.num).then(results => {
        res.json(results);
    });
});

app.get("/images/more", (req, res) => {
    getMoreImages(req.query.id).then(results => {
        res.json(results);
    });
});

app.get("/image", (req, res) => {
    const image = getImage(req.query.id);
    const comments = getComments(req.query.id);

    Promise.all([image, comments])
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            console.log(err.message);
        });
});
app.post("/comment", (req, res) => {
    addComment(req.body.comment)
        .then(results => {
            res.json(results);
        })
        .catch(err => console.log(err.message));
});

app.post("/delete", delImg, (req, res) => {
    const image = delImage(req.body.id);
    const comments = delComments(req.body.id);

    Promise.all([image, comments])
        .then(() => {
            console.log("image and comments were wiped out");
            res.json({ deleted: true });
        })
        .catch(err => {
            console.log(err.message);
        });
});

app.listen(8080, () => console.log("listening on 8080"));
