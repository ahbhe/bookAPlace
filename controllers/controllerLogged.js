exports.get_AllBookingsLogged = (req, res) =>{
    res.render('allBookingsLogged');
}

exports.get_ManageBookings = (req, res) =>{
    res.render('manageBookingsLogged');
}

exports.get_MyProfile = (req, res) =>{
    res.render('myProfileLogged');
}

exports.get_Logout = (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
}