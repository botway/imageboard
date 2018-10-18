(function() {
    Vue.component("add-comment", {
        props: ["imgid"],
        data: function() {
            return {
                username: "",
                comment: ""
            };
        },
        methods: {
            addComment: function() {
                var comment = {
                    username: this.username,
                    comment: this.comment,
                    image_id: this.imgid
                };
                this.$emit("insert", comment);
                axios
                    .post("/comment", {
                        comment
                    })
                    .then(function(results) {
                        console.log(results);
                    });
            }
        },
        template: "#add-comment-template"
    });
    Vue.component("comments", {
        props: ["imgid", "username", "comment", "created"],
        template: "#comments-template"
    });
    Vue.component("image-modal", {
        props: ["imgid"],
        data: function() {
            return {
                url: "",
                title: "",
                desc: "",
                username: "",
                comments: []
            };
        },
        mounted: function() {
            var self = this;
            axios
                .get("/image", {
                    params: {
                        id: this.imgid
                    }
                })
                .then(function(response) {
                    self.url = response.data[0].url;
                    self.title = response.data[0].title;
                    self.desc = response.data[0].description;
                    self.username = response.data[0].username;
                    self.comments = response.data[1];
                })
                .catch(function(err) {
                    console.log(err.message);
                });
        },
        template: "#img-modal-template",
        methods: {
            clickClose: function() {
                this.$emit("close");
            },
            updateComments: function(data) {
                this.comments.unshift(data);
            }
        }
    });
    new Vue({
        el: "#main",
        data: {
            title: "",
            hasMore: true,
            username: "",
            desc: "",
            images: [],
            imgId: ""
            //imgID: location.hash.slice(1)
        },
        mounted: function() {
            var self = this;
            //addEventListener("hashchange", function(){self.imgId})
            //move ajax request function to methods to be reused
            axios
                .get("/images")
                .then(function(response) {
                    self.images = response.data;
                    //if(!resonse.data.image){self.$emit("close")}
                })
                .catch(function(err) {
                    console.log(err.message);
                    //self.$emit("close");
                });
        },
        watch: {
            // imgId: function() {
            //     axios.get("/images" + this.id);
            // }
        },
        methods: {
            handleFileChange: function(e) {
                this.file = e.target.files[0];
            },
            clickImg: function(imgId) {
                this.imgId = imgId;
            },
            getMore: function() {
                var self = this;
                axios
                    .get("/images/more", {
                        params: {
                            id: this.images[this.images.length - 1].id
                        }
                    })
                    .then(function(response) {
                        self.images = self.images.concat(response.data);
                        if (
                            self.images[self.images.length - 1].id ==
                            response.data[0].last
                        ) {
                            self.hasMore = false;
                            return;
                        }
                        // if (!response.data.length) {
                        //     self.hasMore = false;
                        //     return;
                        // }
                        //if(!resonse.data.image){self.$emit("close")}
                    })
                    .catch(function(err) {
                        console.log(err.message);
                        //self.$emit("close");
                    });
            },
            closeModal: function() {
                this.imgId = "";
            },
            upload: function() {
                var formData = new FormData();
                formData.append("file", this.file);
                formData.append("desc", this.desc);
                formData.append("title", this.title);
                formData.append("username", this.username);
                axios.post("/upload", formData).then(results => {
                    this.images.unshift(results.data);
                });
            }
        }
    });
})();
