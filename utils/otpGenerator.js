function generateOTP() {
  return Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
}
const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

module.exports = { generateOTP, otpExpire };