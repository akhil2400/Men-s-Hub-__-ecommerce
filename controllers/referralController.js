const Referral = require('../models/referralModel');
const User = require('../models/userModel');

const renderReferral = async (req, res) => {
  try {
    // Check if session data exists and includes the email
    const { email } = req.session.userData || {};
    if (!email) {
      return res.status(400).send('Invalid session data. Please log in.');
    }

    // Fetch the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found.');
    }

    console.log('User:', user);

    // Check if a referral exists for the user
    let referral = await Referral.findOne({ user: user._id });

    // If no referral exists, create a new referral entry
    if (!referral) {
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      referral = await Referral.create({
        user: user._id,
        referredUser: user._id, // If referredUser should be null initially, update this accordingly
        referralCode,
        totalAmount: "₹0", // Ensure this is consistent with your application logic
      });
    }

    console.log('Referral:', referral);

    // Render the referral page with referral code and total amount
    res.render('referral', { referralCode: referral.referralCode, totalAmount: referral.totalAmount });
  } catch (error) {
    console.error('Error rendering referral page:', error);
    res.status(500).send('Internal Server Error');
  }
};


module.exports = {
  renderReferral
};