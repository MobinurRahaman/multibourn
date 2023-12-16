// Generate random OTP of 6 digits
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default generateOTP;
