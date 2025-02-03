exports.get_errPage = (req, res) =>{
    errCode = req.params.err;
    res.render('error', {err: errCode});
}