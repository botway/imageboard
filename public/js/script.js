(function() {
    var VueMasonryPlugin = window["vue-masonry-plugin"].VueMasonryPlugin;
    Vue.use(VueMasonryPlugin);
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
                comments: [],
                next: "",
                prev: ""
            };
        },
        mounted: function() {
            this.getModalContent();
        },
        template: "#img-modal-template",
        watch: {
            imgid: function() {
                this.getModalContent();
            }
        },
        methods: {
            clickClose: function() {
                this.$emit("close");
            },
            delImg: function() {
                var self = this;
                axios
                    .post("/delete", { imgUrl: this.url, id: this.imgid })
                    .then(function(response) {
                        self.$emit("close");
                        self.$emit("remove", this.imgid);
                    })
                    .catch(function(err) {
                        console.log(err.message);
                    });
            },
            updateComments: function(data) {
                this.comments.unshift(data);
            },
            getModalContent: function() {
                var self = this;
                console.log("id", self.imgid);
                axios
                    .get("/image", {
                        params: {
                            id: self.imgid
                        }
                    })
                    .then(function(response) {
                        if (!response.data) {
                            self.$emit("close");
                        }
                        self.url = response.data[0].url;
                        self.title = response.data[0].title;
                        self.desc = response.data[0].description;
                        self.username = response.data[0].username;
                        self.comments = response.data[1];
                        self.next = response.data[0].next;
                        self.prev = response.data[0].prev;
                    })
                    .catch(function(err) {
                        self.$emit("close");
                        console.log(err.message);
                    });
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
            imgurl: "",
            images: [],
            imgId: ""
        },
        mounted: function() {
            var self = this;
            this.getImages();
            addEventListener("hashchange", function() {
                self.imgId = location.hash.slice(1);
            });
        },
        methods: {
            getImages: function() {
                var self = this;
                axios
                    .get("/images")
                    .then(function(response) {
                        self.images = response.data;
                    })
                    .catch(function(err) {
                        console.log(err.message);
                    });
            },
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
                                response.data[0].last ||
                            !response.data.length
                        ) {
                            self.hasMore = false;
                            return;
                        }
                    })
                    .catch(function(err) {
                        console.log(err.message);
                    });
            },
            closeModal: function() {
                this.imgId = "";
                location.hash = "";
            },
            delImgCard: function(id) {
                // console.log(this.images, id);
                //filterArray(id);
                this.getImages();
            },
            upload: function() {
                var formData = new FormData();
                formData.append("file", this.file);
                formData.append("desc", this.desc);
                formData.append("title", this.title);
                formData.append("username", this.username);
                formData.append("imgurl", this.imgurl);
                axios.post("/upload", formData).then(results => {
                    console.log("results", results);
                    // console.log("post upload res:", results.data);
                    this.images.unshift(results.data);
                });
            }
        }
    });
    function filterArray() {}
})();
