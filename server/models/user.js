const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  password: String,
  facebook: String,
  tokens: Array,
  profile: {
    name: {
      type: String,
      default: ""
    },
    picture: {
      type: String,
      default: ""
    }
  },
  address: String,
  history: [
    {
      paid: {
        type: Number,
        default: 0
      },
      item: {
        type: Schema.Types.ObjectId,
        ref: "Product"
      }
    }
  ]
});

// Hash user password before saving to database
userSchema.pre("save", next => {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

//Compare entered password and password in database
userSchema.methods.comparePassword = password => {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.gravatar = size => {
  if (!this.size) size = 200;
  if (!this.email) return "https://gravatar.com/avatar/?s" + size + "&d=retro";
  const md5 = crypto
    .createHash("md5")
    .update(this.email)
    .digest("hex");
  return "https://gravatar.com/avatar/" + md5 + "?s=" + size + "&d=retro";
};

const User = mongoose.model("User", userSchema);

module.exports = User;
