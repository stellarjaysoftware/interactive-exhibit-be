const mongoose = require("mongoose");
import {SchemaDefinition} from "mongoose";

const commentDefinition:SchemaDefinition = {
  text: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  hidden: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
    ref: 'User'
  }
};

const commentSchema = new mongoose.Schema(commentDefinition, {
  timestamps: true
});

const AppComment = mongoose.model('Comment', commentSchema);

module.exports = {
  AppComment: AppComment
}

