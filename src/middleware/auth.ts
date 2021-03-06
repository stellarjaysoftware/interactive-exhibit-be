import {Request, Response} from "express";
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const auth = async (req: Request, res: Response, next:() => void): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, 'exhibit-app')
    const user = await User.findOne({_id: decoded._id, 'tokens.token':token});
    if(!user) {
      throw new Error();
    }
    res.locals.token = token;
    res.locals.user = user;
    // TODO: figure out how to set this when admin
    // res.locals.isAdmin = true;
    next();
  } catch (error) {
    res.status(401).send({ error: 'please authenticate'});
  }
}

module.exports = { auth }
