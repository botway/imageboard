const db = require("./db").db;

const getAllImages = function() {
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

const getImage = function(id) {
    const q = `
        SELECT * FROM images
        WHERE id = $1;
    `;
    return db
        .query(q, [id])
        .then(results => {
            return results.rows[0];
        })
        .catch(err => {
            console.log(err.message);
        });
};

const saveImage = function(data) {
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

const getComments = function(id) {
    const q = `
        SELECT * FROM comments
        WHERE image_id = $1
    `;
    return db
        .query(q, [id])
        .then(results => {
            return results.rows;
        })
        .catch(err => console.log(err.message));
};

const addComment = function(data) {
    const q = `
        INSERT INTO comments
        (comment, image_id, username)
        VALUES
        ($1, $2, $3)
        RETURNING comment, username, image_id
    `;

    const params = [data.comment, data.image_id, data.username];

    return db
        .query(q, params)
        .then(results => {
            return results.rows[0];
        })
        .catch(err => console.log(err.message));
};

module.exports = {
    getAllImages,
    getImage,
    saveImage,
    getComments,
    addComment
};
