const mongoose = require("mongoose");
import {SchemaDefinition} from "mongoose";

const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { Task } = require('../models/Task');

const userDefinition:SchemaDefinition = {
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value:string) {
      if (!validator.isEmail(value)) {
        throw new Error('invalid email');
      }
    }
  },
  password: {
    type: String,
    trim: true,
    required: true,
    minLength: 7,
    validate(value:string) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('password can not contain "password"');
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
};

const userSchema = new mongoose.Schema(userDefinition, {
  timestamps: true
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({_id: user._id.toString()}, 'taskmanagerapp');
  user.tokens = user.tokens.concat({token});
  await user.save();
  return token;
}

// field not stored in the database
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
}

userSchema.statics.findByCredentials = async (email:string, password:string) => {
  const user = await User.findOne({email});
  if (!user) {
    throw new Error('Unable to login');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) {
    throw new Error('Unable to login');
  }
  return user;
}

// hash password before saving
// userSchema.pre('save', async function (next:any) {
//   const user = this;
//
//   if(user.isModified('password')) {
//     user.password = await bcrypt.hash(user.password, 8);
//   }
//
//   next();
// });

// userSchema.pre('remove', async function (next) {
//   const user = this;
//   await Task.deleteMany({owner: user._id});
//   next();
// })

const User = mongoose.model('User', userSchema);

module.exports = {
  User
}

