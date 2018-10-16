const db = require("./db").db;

const getImages = function() {
    const q = `
        SELECT * FROM images;
    `;
    return db
        .query(q)
        .then(results => {
            return results.rows;
        })
        .catch(err => {
            console.log(err.message);
        });
};

const saveImage = function(data) {
    console.log("saving image");
    const q = `
        INSERT INTO images
        (url, username, title, description)
        VALUES
        ($1,$2,$3,$4)
        RETURNING url, username, title, description;
    `;

    const params = [
        data.url,
        data.username || null,
        data.title || null,
        data.description || null
    ];

    return db
        .query(q, params)
        .then(results => {
            return results.rows[0];
        })
        .catch(err => console.log(err.message));
};

module.exports = {
    getImages,
    saveImage
};
