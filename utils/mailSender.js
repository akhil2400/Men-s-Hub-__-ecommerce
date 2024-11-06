const nodeMailer = require("nodemailer");
console.log('bb')

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

async function sendOTP(email, otp) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Verification Email",
      text: `Please confirm your OTP
      Here is your OTP code: ${otp}`,
    });
    console.log('otp~~~joy')
  } catch (error) {
    console.log(error);
  }
}

module.exports = {sendOTP};