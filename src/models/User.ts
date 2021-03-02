const mongoose = require("mongoose");
import {SchemaDefinition} from "mongoose";

const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { Task } = require('../models/Task');

export type TokenContainer = {
  _id: string,
  token: string
}

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
  // TokenContainer[]
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

userSchema.methods.generateAuthToken = async function (): Promise<string> {
  const user = this;
  const token = jwt.sign({_id: user._id.toString()}, 'exhibit-app');
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

userSchema.methods.toJSON = function (): object {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
}

userSchema.statics.emailIsAvailable = async (email:string): Promise<boolean> => {
  const user = await User.findOne({email});
  return !user;
}

userSchema.statics.findByCredentials = async (email:string, password:string): Promise<typeof User> => {
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
userSchema.pre('save', async function (next:any): Promise<void> {
  // @ts-ignore
  const user = this as User;

  if(user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// TODO: when user deletes, remove related records?
// userSchema.pre('remove', async function (next) {
//   const user = this;
//   await Task.deleteMany({owner: user._id});
//   next();
// })

const User = mongoose.model('User', userSchema);

module.exports = {
  User
}

