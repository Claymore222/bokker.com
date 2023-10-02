const express = require("express");
const common = require("../Modules/comon");
const user = require("../models/user");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", common.auth, async (req, res) => {
    try {

        const currentUser = await user.findOne({ email: req.session.mail });

        res.render("edituser", { user: currentUser });
    } catch (err) {
        console.error("Hata:", err);
        res.status(500).send("Sunucu hatası");
    }
});

async function getDownloadUrl(bucket, fileName) {
    const file = bucket.file(fileName);
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2500'
    });
    return url;
}

async function uploadImageToFirebase(file) {
    const bucket = common.admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET_NAME);
    const blob = bucket.file(file.originalname);
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: file.mimetype
        }
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', reject);
        blobStream.on('finish', async () => {
            try {
                const publicUrl = await getDownloadUrl(bucket, file.originalname);
                resolve(publicUrl);
            } catch (error) {
                reject(error);
            }
        });

        blobStream.end(file.buffer);
    });
}

router.post("/edit/:id", common.auth, upload.single('profileImage'), async (req, res) => {

    try {
        const currentUser = await common.User.findById(req.params.id);

        if (!currentUser) {
            return res.status(404).send("User not found");
        }

        const bucket = common.admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET_NAME);
        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        });

        blobStream.end(req.file.buffer);
        blobStream.on('finish', async () => {
            const publicUrl = await getDownloadUrl(bucket, req.file.originalname);

            currentUser.first_name = req.body.first_name;
            currentUser.last_name = req.body.last_name;
            currentUser.imageURL = publicUrl;
            await currentUser.save();

            console.log("Edited User ==>" + currentUser.first_name)
            console.log("Edited User ==>" + currentUser.last_name)
            console.log("Edited User ==>" + currentUser.imageURL)
            res.redirect("/profile");
        });

        blobStream.on('error', (error) => {
            console.error("Something went wrong while uploading image to Firebase Storage:", error);
            res.status(500).send("Failed to upload image");
        });
    } catch (error) {
        console.error("Error while updating user:", error);
        res.status(500).send("Internal server error");
    }
});

router.get("/edit/biography/:id", common.auth, async (req, res) => {
    try {
        res.redirect("/profile")
    } catch (error) {
        console.log(error)
    }
})

router.post("/edit/biography/:id", async (req, res) => {
    return res.redirect("/profile");
});



module.exports = router;