const express = require('express')
const {ObjectId} = require('mongodb')
const session = require('express-session')
const app = express()

const { insertObject ,getIndexDocuments,getlichsu, getAllDocuments, FindAllDocumentsByName, checkUserRole, FindDocumentsByEmail, FindDocumentsByPhone, FindDocumentsById, updateCollection,DeleteDocumentsByid} = require('./databaseHandler')
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: '12121121@adas', cookie: { maxAge: 60000 }, saveUninitialized: false, resave: false }))
app.use(express.static('public'))
const adminController = require('./controllers/admin')
const { redirect } = require('express/lib/response')
const { all } = require('./controllers/admin')
const async = require('hbs/lib/async')
//cac request co chua /admin se di den controller admin
app.use('/admin', adminController)

app.get('/inforProduct', async (req,res)=>{
    const id = req.query.id
    const results = await FindDocumentsById("Products", id)
    res.render('inforProduct', {products : results})

}) 

// app.get('/allProduct', async (req,res)=>{
//     const results = await getAllDocuments("Products")
//     res.render('allProduct', {products : results})
// })

app.get('/lichsu', async (req,res)=>{
    customer = req.session["Customer"]
    const id = req.query.id
    const results = await getlichsu("Order")
    res.render('lichsu', {Order : results, customerI: customer})
})
app.get('/login', async (req,res)=>{
    res.render('login')
})

app.get("/logout", (req, res) => {
    req.session["Customer"] = null;
    res.redirect("/");
});

app.post('/login',async (req,res)=>{
    const emailInput = req.body.txtLName
    const passInput = req.body.txtLPass
    const role = await checkUserRole(emailInput, passInput)
    console.log(role)
    if (role == -1) {
        res.redirect('/login')
    } else if (role == "Customer"){
        const results = await FindDocumentsByEmail(emailInput)
        req.session["Customer"] = {
            // id: results._id,
            name: results.name,
            phone: results.phone,
            gender: results.gender,
            city: results.city,
            country: results.country,
            email: emailInput,
            role: role
        }
        res.redirect('/')
    }
})

app.get('/register', async (req,res)=>{
    res.render('register')
}) 
app.post('/register', async (req,res)=>{
    const nameInput = req.body.txtName
    const phoneInput = req.body.txtPhone
    const emailInput = req.body.txtEmail
    const genderInput = req.body.txtGender
    const cityInput = req.body.txtCity
    const countryInput = req.body.txtCountry
    const passwordInput = req.body.txtPassword
    const confirmInput = req.body.txtConfirm
    const roleC = "Customer";
    const resultEmail = await FindDocumentsByEmail(emailInput)
    const resultPhone = await FindDocumentsByPhone(phoneInput)
    if(isNaN(phoneInput)==true){
        const errorMessage = "Số điện thoại của bạn không đúng định dạng!!"
        const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput, role: roleC}
        res.render('register', {errorNa: errorMessage , oldValues:oldValues})
        return;
    }
    if(resultPhone != null)
    {
        errorEmail = "Phone number đã được sử dụng"
        const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput, role: roleC}
        res.render('register', {errorPhones: errorEmail,  oldValues:oldValues})
        return;
    }
    if(resultEmail != null)
    {
        errorEmail = "Email đã được sử dụng"
        const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput, role: roleC}
        res.render('register', {errorE: errorEmail,  oldValues:oldValues})
        return;
    }
    if(phoneInput.length >= 12 || phoneInput.length < 9)
    {
        const errorDes="do dai cua sdt tu 10 - 12";
        const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput, role: roleC} 
        res.render('register', {errorD: errorDes,  oldValues:oldValues})
        return;
    }
    if(passwordInput != confirmInput)
    {
        const errorConfirm = "Sai mật khẩu"
        const oldValues = {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput, role: roleC}
        res.render('register', {errorCon: errorConfirm,  oldValues:oldValues}) 
        return;
    }
    const newC =  {name: nameInput, phone: phoneInput, email: emailInput, gender: genderInput, city: cityInput, country: countryInput, password: passwordInput, role: roleC}
    const collectionName = "Users"
    insertObject(collectionName, newC)
    res.redirect('login')
}) 
app.get('/', async (req,res)=>{
    customer = req.session["Customer"]
    const searchInputH = req.query.txtSearchHome
    const collectionName = "Products"
    const results = await getIndexDocuments(collectionName)
    const resultSearch = await FindAllDocumentsByName(searchInputH)
    //2.hien thu du lieu qua HBS
    if(searchInputH == null)
    {         
        res.render('index', {products: results, customerI: customer})       
    }else{   
        if(resultSearch.length != 0)
        {                 
            res.render('index', {products : resultSearch, customerI: customer})
        }else {
            const messageSH = " Khong tim thay"
            res.render('index', {products: results, messSH : messageSH, customerI: customer})
        }
    }   
    
})


app.get('/allProduct', async (req,res)=>{
    customer = req.session["Customer"]
    const searchInputH = req.query.txtSearchHome
    const collectionName = "Products"
    const results = await getAllDocuments(collectionName)
    const resultSearch = await FindAllDocumentsByName(searchInputH)
    //2.hien thu du lieu qua HBS
    if(searchInputH == null)
    {         
        res.render('index', {products: results, customerI: customer})       
    }else{   
        if(resultSearch.length != 0)
        {                 
            res.render('index', {products : resultSearch, customerI: customer})
        }else {
            const messageSH = " Khong tim thay"
            res.render('allProduct', {products: results, messSH : messageSH, customerI: customer})
        }
    }   
    
})

app.get('/delete',async (req,res)=>{
    const id = req.query.id
    DeleteDocumentsByid("Order", id)
        res.redirect('/lichsu')
    
})

app.get('/updateProfile',requiresLoginCustomer, async (req,res)=>{
    customer = req.session["Customer"]
    const email = FindDocumentsByEmail(customer.email)
    const results = FindDocumentsByEmail(email)
    res.render('updateProfile', {profile: results, customerI: customer})
})

app.post('/updateProfile',requiresLoginCustomer, async (req,res)=>{
    const nameUpdate = req.body.txtName
    const phoneUpdate = req.body.txtPhone
    const genderUpdate = req.body.txtGender
    const cityUpdate = req.body.txtCity
    const countryUpdate = req.body.txtCountry
    //lấy id để từ id đó sửa các giá trị khác
    const email = req.body.txtEmail
    const dbo = await FindDocumentsByEmail(email)
    const myquery = { _id: ObjectId(dbo._id) }
    const newUpdate = { $set: {name : nameUpdate, phone : phoneUpdate, email: dbo.email, gender : genderUpdate,city:cityUpdate, country : countryUpdate,password: dbo.password, role: dbo.role}}
    await updateCollection("Users", myquery, newUpdate)
    res.redirect('/allProduct')
})

function requiresLoginCustomer(req,res,next){
    if(req.session["Customer"]){
        return next()
    }else{
        res.redirect('/login')
    }
}


app.post('/buy',requiresLoginCustomer, async (req,res)=>{
    const id = req.body.txtId
    customer = req.session["Customer"]
    const results = await FindDocumentsById("Products", id)
    let cart = req.session["cart"]
    //chua co gio hang trong session, day se la sp dau tien
    if(!cart){
        let dict = {
            user: customer.name,
            // id: customer._id,
            cart: [],
        }
            results.qty = 1;
            results.subtotal = results.price * results.qty;
            dict.cart.push(results);
            req.session["cart"] = dict;
            console.log(dict)
    }else{
        dict = req.session["cart"]
        //kiem tra book co trong dict k
        //https://stackoverflow.com/questions/7364150/find-object-by-id-in-an-array-of-javascript-objects
        // Phương thức findIndex() trả về chỉ số của phần tử đầu tiên trong mảng đáp ứng chức năng kiểm tra được cung cấp. Nếu không, -1 được trả về.
        var oldBook = dict.cart.findIndex((book) => book._id == results._id);
        if (oldBook == -1) {
            results.qty = 1;
            results.subtotal = results.price * results.qty;
            dict.cart.push(results);
        } else {
            const oBook = dict.cart[oldBook];
            oBook.qty += 1;
            oBook.subtotal = oBook.price * oBook.qty;
        }
        req.session["cart"] = dict
        console.log(dict)
    }
    res.redirect('/')
})
app.get('/remove', async (req,res)=>{
    dict = req.session["cart"]
    const id = req.body.txtId
    for(var i = 0; i < dict.cart.length; i++){
        if(dict.cart._id == id){
            console.log(dict.cart._id)
            dict.cart.splice(i,1)
            return res.redirect('cart')
        }
    }    
})
app.get('/Cart',requiresLoginCustomer, async (req,res)=>{
    let quantity = 0;
    let ship = 0;
    let total = 0;
    let totalC = 0;
    const dict = req.session["cart"]
    for(var i = 0; i < dict.cart.length; i++){
        quantity += dict.cart[i].qty
        total += dict.cart[i].subtotal
    }
    if(quantity == 0)
    {
        ship = 0
    }else if(quantity < 10){
        ship = 10
    }else{
        ship = 5
    }

    totalC = total + ship
    res.render('Cart',{cart: dict, quantity: quantity, ship: ship, total: total, totalC: totalC})

})
app.post('/order', requiresLoginCustomer,async (req, res) => {
    const cart = req.session["cart"]
    // var today = new Date();
    // var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()+ " -- "+ today.getDay()+"/"+ today.getMonth()+"/"+today.getFullYear();
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    console.log(dateTime)
    const newO = {cart: cart, time: dateTime, status:"Waiting for the goods"}
    insertObject("Order",newO)
    req.session["cart"] = null;
    res.redirect('/')
})
const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log("Server is running! " + PORT)