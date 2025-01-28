exports.get_Home = (req, res) =>{
    res.render('index');
}

exports.get_Register = (req, res) =>{
    res.render('register');
}

exports.get_Login = (req, res) =>{
    res.render('login');
}