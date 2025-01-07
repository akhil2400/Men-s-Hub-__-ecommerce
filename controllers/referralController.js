const Referral = require('../models/referralModel');
const User = require('../models/userModel');

const renderReferral = async (req, res) => {
  try {
    const { email } = req.session.userData;

    if (!email) {
      return res.status(400).send('Invalid session data. Please log in.');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    console.log('User:', user);

    let referral = await Referral.findOne({ user: user._id });

    if (!referral) {
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      referral = await Referral.create({
        user: user._id,
        referredUser: user._id, 
        referralCode,
        totalAmount:"₹0"
      });
    }

    console.log('Referral:', referral);

    res.render('referral', { referralCode: referral.referralCode , totalAmount: referral.totalAmount });
  } catch (error) {
    console.error('Error rendering referral page:', error);
    res.status(500).send('Internal Server Error');
  }
};


module.exports = {
  renderReferral
};