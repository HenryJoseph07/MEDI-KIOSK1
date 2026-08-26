const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const processDocument = async (file) => {
    const serviceUrl = process.env.AI_SERVICE_URL;

    if (!serviceUrl) {
        throw new Error("AI_SERVICE_URL is not configured");
    }

    const form = new FormData();
    form.append("file", fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype
    });

    const response = await axios.post(
        `${serviceUrl.replace(/\/$/, "")}/process`,
        form,
        {
            headers: form.getHeaders(),
            maxContentLength: 25 * 1024 * 1024,
            maxBodyLength: 25 * 1024 * 1024,
            timeout: 120000
        }
    );

    if (!response.data || typeof response.data !== "object") {
        throw new Error("AI service returned an invalid response");
    }

    return response.data;
};

module.exports = { processDocument };