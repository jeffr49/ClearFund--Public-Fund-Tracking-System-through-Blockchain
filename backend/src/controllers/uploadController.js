const { uploadToIPFS } = require("../services/ipfs");

exports.uploadProof = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "file is required" });
    }

    const hash = await uploadToIPFS(file);

    res.json({
      ipfsHash: hash,
      url: `https://gateway.pinata.cloud/ipfs/${hash}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};