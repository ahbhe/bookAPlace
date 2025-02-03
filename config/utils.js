exports.userCheck = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect("/err/401");
  }
};
