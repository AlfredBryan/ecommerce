module.exports = {
  facebook: {
    clientID: process.env.FACEBOOK_ID || "205037839853153",
    clientSecret:
      process.env.FACEBOOK_SECRET || "dc97bd3f844279b70631391ef3aad0cc",
    profileFields: ["emails", "displayName"],
    callbackURL: "http://localhost:4000/auth/facebook/callback"
  }
};
