// let roleCheck = async (req, res, next) => {
//   console.log("roleCheck Middleware: ", req.url);
  
//   // Check if the route is an admin route
//   if (req.url.startsWith('/admin')) {
    
//     // Ensure user is logged in
//     if (!req.session.loggedIn) {
//       console.log("User not logged in. Redirecting to login page.");
//       return res.redirect('/register');
//     }
    
//     // Get user email from session and find user in the database
//     const email = req.session.userEmail;
//     const user = await userModal.findOne({ email });
    
//     // Verify if user exists and is an admin
//     if (!user || user.role !== "admin") {
//       console.log("User does not have admin privileges. Redirecting to unauthorized page.");
//       return res.redirect('/home');
//     }
//   }
  
//   // If checks pass, proceed to the next middleware
//   next();
// };

// module.exports = roleCheck;
