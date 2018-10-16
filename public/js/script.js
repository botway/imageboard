(function() {
    new Vue({
        el: "#main",
        data: {
            title: "",
            username: "",
            desc: "",
            images: []
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
            upload: function(e) {
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
