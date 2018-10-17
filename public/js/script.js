(function() {
    Vue.component("add-comment", {
        props: ["id"],
        data: function() {
            return {
                username: "some user",
                comment: "some comment"
            };
        },
        template: "#comments-template"
    });
    Vue.component("comments", {
        props: ["id"],
        data: function() {
            return {
                title: "some title",
                username: "some user",
                comment: "Some comment",
                created: "11/11/2011"
            };
        },
        template: "#comments-template"
    });
    Vue.component("image-modal", {
        props: ["id"],
        data: function() {
            return {
                url: "",
                title: "",
                desc: "",
                username: ""
            };
        },
        mounted: function() {
            var self = this;
            axios
                .get("/image", {
                    params: {
                        id: this.id
                    }
                })
                .then(function(response) {
                    self.url = response.data.url;
                    self.title = response.data.title;
                    self.desc = response.data.description;
                    self.username = response.data.username;
                })
                .catch(function(err) {
                    console.log(err.message);
                });
        },
        template: "#img-modal-template",
        methods: {
            clickClose: function() {
                this.$emit("close");
            }
        }
    });
    new Vue({
        el: "#main",
        data: {
            title: "",
            username: "",
            desc: "",
            images: [],
            imgId: ""
        },
        mounted: function() {
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
        methods: {
            handleFileChange: function(e) {
                this.file = e.target.files[0];
            },
            clickImg: function(imgId) {
                this.imgId = imgId;
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
