const express = require('express');
const userModel = require('../models/userModel');
const categoryModel = require('../models/categoryModel');


module.exports = {
  async loadusermanagement(req, res) {
    try {
      const users = await userModel.find({});
      console.log(users)
      if (!users) {
        return res.status(200).render('usermanagement', { msg: 'No users found' });
      }
      return res.status(200).render('usermanagement', { user: users });
    } catch (err) {
      console.log(err)
    }
    res.render('usermanagement.');

  },

  async banuser(req, res) {
    console.log("23445---")
    const { id, val } = req.query;
    try {
      console.log(id, val)
      if (val === "Ban") {
        await userModel.updateOne({ _id: id }, { isDeleted: true });
      } else {
        await userModel.updateOne({ _id: id }, { isDeleted: false });
      }
      res.status(200).json({ val: true });
    } catch (err) {
      res.status(500).json({ val: false });
    }
  },


  async loadcategorymanagement(req, res) {
    console.log('dhhd')
    try {
      const categories = await categoryModel.find({});
      console.log(categories)
      if(!categories){
        return res.status(200).render('category', {
          category: null,
        });
      }
      return res.status(200).render('category', {
        category: categories,
      });
    } catch (err) {
      console.log(err);
      res.status(500).render('category', {
        category: null,
      });
    }
  },

  }


