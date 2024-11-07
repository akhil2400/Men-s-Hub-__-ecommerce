const { sendOTP } = require('../utils/mailSender');
const otpSchema = require('../models/otpModel');
const User = require('../models/userModel');
const { generateOTP, otpExpire } = require('../utils/otpGenerator');



module.exports = {
  async requestOtp(req, res) {
    console.log('ssgdg')
    try {
      const {isResend} = req.body;
      if(isResend){
        const { email } = req.session.userData;
        await otpSchema.deleteMany({ email });
        const otp = generateOTP();
        await sendOTP(email, otp);

        await otpSchema.create({
          email,
          otp,
          createdAt: Date.now(),
          expiresAt: otpExpire
        });

        return res.status(200).json({
          st: true,
          msg: "OTP sent successfully....",
        });
      }else{
        const { userName, email, password, mobileNumber, gender } = req.body;
        const userExist = await User.findOne({ userName });
        const emailExist = await User.findOne({ email });
        if (userExist) {
          return res.status(400).json({
            type: "userName",
            st:false,
            msg: "Username already exist",
            
          });
        } else if (emailExist) {
          return res.status(400).json({
            type: "email",
            st:false,
            msg: "Email already exist",
          });
        }
        req.session.userData = {userName, email, password, mobileNumber, gender};
        console.log('1~~~~~')
        console.log(req.session.userData);
        const otp = generateOTP();
        console.log('otp: ', otp);
        
        await otpSchema.deleteMany({ email });
        await sendOTP(email, otp);
        await otpSchema.create({
          email,
          otp,
          createdAt: Date.now(),
          expiresAt: otpExpire
        });
        console.log('OTP SENDED SUCCESSFULLY');
  
        return res.status(200).json({
          type: null,
          st: true,
          msg: "OTP sent successfully",
        });
      }

    } catch (error) {
      console.log('5')
      console.log("ERROR IN SENDING OTP", error);

    }

  },
 

  async fotpverify(req, res) {
    console.log("1======");
    const { otp } = req.body;
    console.log(otp);
    console.log(req.session.emailverfy);
    const user = await otpSchema.findOne({ email: req.session.emailverfy });
    if (!user) {
      return res.status(400).json({
        st: false,
        msg: 'Enter valid OTP',
      });
    }
    if (user.otp !== otp) {
      return res.status(400).json({
        st: false,
        msg: 'Enter valid OTP',
      });
    }
    return res.status(200).json({
      st: true,
      msg: 'OTP verified successfully',
    });
  },


};



