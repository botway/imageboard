const db = require("./db").db;

const getAllImages = function() {
    const q = `
        SELECT * FROM images
        ORDER BY id DESC
        LIMIT 15;
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

const getMoreImages = function(lastid) {
    const q = `
        SELECT *, (
            SELECT id FROM images
            ORDER BY id ASC
            LIMIT 1
        ) AS last FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 6;
    `;

    return db
        .query(q, [lastid])
        .then(results => {
            return results.rows;
        })
        .catch(err => {
            console.log(err.message);
        });
};

const getImage = function(id) {
    const q = `
        SELECT *,
        (SELECT id FROM images WHERE id > $1 ORDER BY id ASC LIMIT 1) AS prev,
        (SELECT id FROM images WHERE id < $1 ORDER BY id DESC LIMIT 1) AS next
        FROM images
        WHERE id = $1;
    `;
    return db
        .query(q, [id])
        .then(results => {
            console.log(results.rows[0]);
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
        RETURNING url, username, title, description,id;
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

const delImage = function(id) {
    console.log("img_ID", id);
    const q = `
        DELETE FROM images
        WHERE id =$1;
    `;
    return db
        .query(q, [id])
        .then(() => {
            console.log("img was deleted from db");
        })
        .catch(err => console.log(err.message));
};

const getComments = function(id) {
    const q = `
        SELECT comment, username, created_at
        FROM comments
        WHERE image_id = $1;
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

const delComments = function(id) {
    console.log("commets", id);
    const q = `
        DELETE FROM comments
        WHERE image_id = $1;
    `;
    return db
        .query(q, [id])
        .then(() => {
            console.log("comments were deleted from db");
        })
        .catch(err => console.log(err.message));
};

module.exports = {
    getAllImages,
    getMoreImages,
    getImage,
    saveImage,
    delImage,
    getComments,
    addComment,
    delComments
};
