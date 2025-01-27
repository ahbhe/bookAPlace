const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
    console.log(`BookAPlace ~ Currently listening on port ${PORT}`);
});