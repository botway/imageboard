const knox = require("knox");
const fs = require("fs");
const { s3Url } = require("./config.json");

let secrets;

if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // secrets.json is in .gitignore
}

const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: "spicedling"
});

const upload = function(req, res, next) {
    console.log("uploading", req.file);
    if (!req.file) {
        return res.sendStatus(500);
    }
    const s3Request = client.put(req.file.filename, {
        "Content-Type": req.file.mimetype,
        "Content-Length": req.file.size,
        "x-amz-acl": "public-read"
    });
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on("response", s3Response => {
        console.log(s3Response.statusCode);
        if (s3Response.statusCode == 200) {
            next();
        } else {
            res.sendStatus(500);
        }
    });
    fs.unlink(req.file.path, () => {});
};

const delImg = function(req, res, next) {
    const fileName = req.body.imgUrl.replace(s3Url, "");
    client.deleteFile(fileName, (err, res) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log(res.statusCode);
            next();
        }
    });
};

module.exports = {
    upload,
    delImg
};
