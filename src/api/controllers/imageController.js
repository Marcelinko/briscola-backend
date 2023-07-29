const s3 = require("../services/s3");
const getAvatars = async (req, res) => {
  try {
    const avatars = await s3.getAvatars();
    res.status(200).json(avatars);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getAvatars,
};
