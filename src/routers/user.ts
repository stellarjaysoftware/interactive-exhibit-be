import {Request, Response} from "express";
const express = require('express');
const router = new express.Router();
const { User } = require('../models/User');
const { auth }  = require('../middleware/auth');

router.post("/users", async (req: Request, res: Response):Promise<any> => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({user, token});
  } catch (error) {
    console.error(error);
    if (error.toString().toLowerCase().includes('validation')) {
      return res.status(400).send({Error: error.toString()});
    }
    res.status(500).send(error);
  }
});

router.post('/users/login', async (req: Request, res: Response):Promise<any> => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({user, token});
  } catch (error) {
    res.status(400).send();
  }
})

router.post('/users/logout', auth, async (req: Request, res: Response):Promise<any> => {
  try {
    // @ts-ignore
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== res.locals.token;
    })
    await res.locals.user.save();
    res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

// router.post('/users/logoutAll', auth, async (req: Request, res: Response):Promise<any> => {
//   try {
//     req.user.tokens = [];
//     await req.user.save();
//     res.send();
//   } catch (error) {
//     console.error(error);
//     res.status(500).send();
//   }
// });

router.get("/users/me", auth, async (req: Request, res: Response):Promise<any> => {
  // res.send(req.user);
  res.send(res.locals.user);
});

router.patch("/users/me", auth, async (req: Request, res: Response):Promise<any> => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    return res.status(400).send({error: "invalid updates"})
  }
  try {
    // const user = req.user;
    const user = res.locals.user;
    updates.forEach((update) => user[update] = req.body[update]);
    await user.save();
    res.status(200).send(user);
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

// router.delete("/users/me", auth, async (req: Request, res: Response):Promise<any> => {
//   try {
//     await req.user.remove();
//     res.status(200).send(req.user);
//   } catch (error) {
//     console.log(error);
//     if (error.toString().toLowerCase().includes('cast to')) {
//       return res.status(400).send({ "Error": error.toString() });
//     }
//     res.status(500).send(error);
//   }
// });

module.exports = router;
