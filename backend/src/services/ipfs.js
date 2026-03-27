const axios = require("axios");
const FormData = require("form-data");

exports.uploadToIPFS = async (file) => {
  const formData = new FormData();

  formData.append("file", file.buffer, file.originalname);

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
    }
  );

  return res.data.IpfsHash;
};