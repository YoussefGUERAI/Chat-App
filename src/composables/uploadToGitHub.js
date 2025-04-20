import axios from "axios";

export async function uploadToGitHub(imageFile, fileName) {
    const repoOwner = process.env.VUE_APP_GITHUB_REPO_OWNER;
    const repoName = process.env.VUE_APP_GITHUB_REPO_NAME;
    const branch = process.env.VUE_APP_GITHUB_BRANCH;
    const token = process.env.VUE_APP_GITHUB_TOKEN;

    if (!token) {
        throw new Error(
            "GitHub token is missing. Please configure it in your environment."
        );
    }

    const base64Image = await toBase64(imageFile);
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}`;

    try {
        const response = await axios.put(
            url,
            {
                message: `Upload profile picture: ${fileName}`,
                content: base64Image,
                branch: branch,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data.content.download_url;
    } catch (error) {
        if (error.response?.status === 401) {
            console.error(
                "GitHub upload failed: Invalid token or insufficient permissions."
            );
            throw new Error(
                "Failed to upload image. Please check your GitHub token."
            );
        } else if (error.response?.status === 403) {
            console.error("GitHub upload failed: Access forbidden.");
            throw new Error(
                "Failed to upload image. Access to the repository is forbidden."
            );
        } else if (error.response?.status === 422) {
            console.error(
                "GitHub upload failed: Unprocessable entity (e.g., file too large)."
            );
            throw new Error(
                "Failed to upload image. The file may be too large."
            );
        } else {
            console.error(
                "GitHub upload failed:",
                error.response?.data || error.message
            );
            throw new Error("Failed to upload image to GitHub.");
        }
    }
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () =>
            reject(new Error("Failed to convert file to Base64."));
        reader.readAsDataURL(file);
    });
}
