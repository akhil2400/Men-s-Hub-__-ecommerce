const express = require('express');
const userModel = require('../models/userModel');


module.exports = {
  async loadusermanagement(req, res) {
    try{
      const users = await userModel.find({});
      console.log(users)
      if(!users){
          return res.status(200).render('usermanagement',{msg:'No users found'});
      }
      return res.status(200).render('usermanagement',{user:users});
  }catch(err){
      console.log(err)
  }
    res.render('usermanagement.');

  },
}