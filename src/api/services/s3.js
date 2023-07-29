const S3 = require("aws-sdk/clients/s3");

//TODO: ENV file
const s3 = new S3({
  endpoint: "https://971487de0e0f3db00046239819c7e46b.r2.cloudflarestorage.com",
  accessKeyId: "124a4d27c0cbae29f39697a3b94479e0",
  secretAccessKey:
    "106f9ba72a9f27aebbf8ce89a9403a763dec0b7364ea63de236f9beb363013c1",
  signatureVersion: "v4",
});

const getAvatars = async () => {
  const params = {
    Bucket: "briscola",
    Prefix: "avatars/",
  };
  try {
    const objects = (await s3.listObjectsV2(params).promise()).Contents;
    const avatars = [];
    objects.forEach((object) => {
      const params = {
        Bucket: "briscola",
        Key: object.Key,
        Expires: 3600,
      };
      const url = s3.getSignedUrl("getObject", params);
      const avatar = {
        name: object.Key.split("/")[1],
        url,
      };
      avatars.push(avatar);
    });
    return avatars;
  } catch (err) {
    throw new Error("Error getting avatar images");
  }
};

const getCards = async () => {
  const params = {
    Bucket: "briscola",
    Prefix: "cards/",
  };
  try {
    const objects = (await s3.listObjectsV2(params).promise()).Contents;
    const cards = [];
    objects.forEach((object) => {
      const params = {
        Bucket: "briscola",
        Key: object.Key,
        Expires: 3600,
      };
      const url = s3.getSignedUrl("getObject", params);
      const card = {
        name: object.Key.split("/")[1],
        url,
      };
      cards.push(card);
    });
    return cards;
  } catch (err) {
    throw new Error("Error getting card images");
  }
};

module.exports = {
  getAvatars,
};
