import {Request, Response} from "express";
const express = require('express');
const router = new express.Router();
const { AppComment } = require('../models/AppComment');
const { auth } = require('../middleware/auth');

router.post("/comments", async (req: Request, res: Response) => {
  // TODO: run filtering algorithm against comment text and name to determine hidden t|f
  const hidden = false;
  const comment = new AppComment({
    text: req.body.text,
    name: req.body.name,
    hidden,
    // owner: res.locals?.user?._id
  });
  try {
    await comment.save();
    res.status(201).send(comment);
  } catch (error) {
    console.error(error);
    if (error._message.toLowerCase().includes('validation')) {
      return res.status(400).send({Error: error.toString()});
    }
    res.status(500).send();
  }
});

// TODO: fix sorting, & only admins can see hidden comments
// GET /comments?completed=false
// GET /comments?limit=10&skip=0
// GET /comments?sortBy=createdAt&dir=asc
router.get("/comments", async (req: Request, res: Response) => {
  let query = {
    hidden: false
  }
  // const sort = {};
  // if (req.query.completed) {
  //   query = { ...query, completed: req.query.completed === "true" }
  // }
  // if (req.query.sortBy && req.query.dir) {
  //   sort[req.query.sortBy] = req.query.dir === 'asc' ? 1 : -1;
  // }
  // console.warn('query',query);

  try {
    // const findOptions = {
    //   limit: parseInt(req.query.limit),
    //     skip:  parseInt(req.query.skip),
    //   sort
    // }
    const comments = await AppComment.find(query, null);
    if (!comments) {
      return res.status(404).send();
    }
    res.status(200).send(comments);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.get("/comments/:id", auth, async (req: Request, res: Response) => {
  const _id = req.params.id;
  try {
    const comment = await AppComment.findOne({ _id, owner: res.locals.user._id });
    if (!comment) {
      return res.status(404).send();
    }
    res.status(200).send(comment);
  } catch (error) {
    console.log(error);
    if (error.toString().toLowerCase().includes('cast to')) {
      return res.status(400).send({ "Error": error.toString() });
    }
    res.status(500).send();
  }
});

// TODO: only the comment owner or admin should be able to update the comment
router.patch("/comments/:id", auth, async (req: Request, res: Response) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ['text', 'completed'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    return res.status(400).send({error: "invalid updates"})
  }
  try {
    const comment = await AppComment.findOne({ _id, owner: res.locals.user._id });
    if (!comment) {
      return res.status(404).send();
    }
    updates.forEach((update) => comment[update] = req.body[update]);
    await comment.save();
    res.status(200).send(comment);
  } catch (error) {
    // 400: validation error
    // 404: no user found
    console.log(error);
    const message = error.toString().toLowerCase();
    if (message.includes('validation') || message.includes('cast to')) {
      return res.status(400).send({ "Error": error.toString() });
    }
    res.status(500).send(error);
  }
});

// TODO: only the comment owner or admin should be able to update the comment
router.delete("/comments/:id", auth, async (req: Request, res: Response) => {
  const _id = req.params.id;
  try {
    const comment = await AppComment.findOneAndDelete({_id, owner: res.locals.user._id});
    if (!comment) {
      return res.status(404).send();
    }
    res.status(200).send(comment);
  } catch (error) {
    console.log(error);
    if (error.toString().toLowerCase().includes('cast to')) {
      return res.status(400).send({ "Error": error.toString() });
    }
    res.status(500).send(error);
  }
});

module.exports = router;
