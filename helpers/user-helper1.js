var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { response } = require("express");

var objectId = require("mongodb").ObjectID;
const Razorpay = require("razorpay");
const { networkInterfaces } = require("os");
var instance = new Razorpay({
    key_id: "rzp_test_P1qJn93ykpKDDb",
    key_secret: "JuWZzbyfn9iNxVMLtbh1n2PQ",
});

module.exports = {
    /* Login For Admin
    ============================================= */
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}; //null object created

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ username: adminData.username });
            if (user) {
                db.get()
                    .collection(collection.USER_COLLECTION)
                    .findOne({ password: adminData.password })
                    .then((loginStatus) => {
                        // bcrypt.compare(adminData.password, user.password).then((loginStatus) => {
                        if (loginStatus) {
                            response.user = user;
                            response.loginStatus = true;
                            resolve(response);
                        } else {
                            resolve({ loginStatus: false });
                        }
                    });
            } else {
                resolve({ status: false });
            }
        });
    },

    /* SignUp For Vendors
    ============================================= */
    doSignup_Vendor: (vendorData) => {
        let signup_status = true;
        return new Promise(async (resolve, reject) => {
            vendorData.password = await bcrypt.hash(vendorData.ven_password, 10);

            let user = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ ven_email: vendorData.ven_email });

            if (user) {
                resolve({ signup_status: false });
            } else {
                var vendorDetails = {
                    ven_name: vendorData.ven_name,
                    ven_shop: vendorData.ven_shop_name,
                    ven_phone: vendorData.ven_phone,
                    ven_email: vendorData.ven_email,
                    ven_password: vendorData.password,
                    status: "vendor",
                    active: "true",
                    created: new Date(),
                };

                db.get()
                    .collection(collection.VENDOR_COLLECTION)
                    .insertOne(vendorDetails)
                    .then((vendorDetails) => {
                        resolve(vendorDetails.ops[0]);
                    });
            }
        });
    },

    /* Check Email Exist or Not
    ============================================= */
    checkemail_exist: (ven_email) => {
        let signup_status = true;
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ ven_email: ven_email });

            if (user) {
                resolve({ signup_status: true });
            } else {
                resolve({ signup_status: false });
            }
        });
    },

    /* Login For Vendors
    ============================================= */
    doLogin_Vendor: (vendorData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}; //null object created
            let user = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ ven_email: vendorData.email });
            if (user) {
                bcrypt.compare(vendorData.password, user.ven_password).then((loginStatus) => {
                    if (loginStatus) {
                        response.user = user;
                        response.loginStatus = true;
                        resolve(response);
                    } else {
                        resolve({ loginStatus: false });
                    }
                });
            } else {
                resolve({ status: false });
            }
        });
    },

    /* Get All Vendors
    ============================================= */
    get_AllVendors: () => {
        return new Promise(async (resolve, reject) => {
            let vendors = await db.get().collection(collection.VENDOR_COLLECTION).find({ active: "true" }).toArray();
            resolve(vendors);
        });
    },

    /* Get  Vendor Details by id 
    ============================================= */
    get_VendorDetails: (venId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.VENDOR_COLLECTION)
                .findOne({ _id: objectId(venId) })
                .then((vendor) => {
                    resolve(vendor);
                });
        });
    },

    /* Delete Vendor
    ============================================= */
    delete_Vendor: (venId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.VENDOR_COLLECTION)
                // .removeOne({ _id: objectId(venId) })
                .update(
                    { _id: objectId(venId) },
                    {
                        $set: {
                            active: "false",
                        },
                    }
                )
                .then((vendor) => {
                    resolve(vendor);
                });
            // .catch(err => {
            //     console.error(err)
            //   })
        });
    },

    /* Update Vendor
    ============================================= */
    update_Vendor: (venDetails, venId) => {
        return new Promise(async (resolve, reject) => {
            db.get()
                .collection(collection.VENDOR_COLLECTION)
                .updateOne(
                    { _id: objectId(venId) },
                    {
                        $set: {
                            ven_name: venDetails.ven_name,
                            ven_shop: venDetails.ven_shop_name,
                            ven_phone: venDetails.ven_phone,
                        },
                    }
                )
                .then((response) => {
                    resolve({ update_status: true });
                });
        });
    },

    /* Update Vendor Email(username)
    ============================================= */
    change_Email_Vendor: (venDetails) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ ven_email: venDetails.ven_email });
            if (user) {
                resolve({ update_status: false });
            } else {
                db.get()
                    .collection(collection.VENDOR_COLLECTION)
                    .updateOne(
                        { _id: objectId(venDetails.ven_id) },
                        {
                            $set: {
                                ven_email: venDetails.ven_email,
                            },
                        }
                    )
                    .then((response) => {
                        resolve({ update_status: true });
                    });
            }
        });
    },

    /* Change Password  For Vendors
    ============================================= */
    change_Password_Vendor: (vendorData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}; //null object created
            vendorId = vendorData.ven_id;
            let user = await db
                .get()
                .collection(collection.VENDOR_COLLECTION)
                .findOne({ _id: objectId(vendorId) });
            if (user) {
                vendorData.ven_password = await bcrypt.hash(vendorData.new_password, 10);
                bcrypt.compare(vendorData.old_password, user.ven_password).then((loginStatus) => {
                    if (loginStatus) {
                        db.get()
                            .collection(collection.VENDOR_COLLECTION)
                            .updateOne(
                                { _id: objectId(vendorId) },
                                {
                                    $set: {
                                        ven_password: vendorData.ven_password,
                                    },
                                }
                            );
                        response.resetStatus = true;
                        resolve(response);
                    } else {
                        resolve({ resetStatus: false });
                    }
                });
            } else {
                resolve({ resetStatus: "Not a user" });
            }
        });
    },

    /*=============================             Customer Section          ============================== */

    /* SignUp For Users(Customers)
    ============================================= */
    doSignup_User: (userData) => {
        let signup_status = true;
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);

            let cart = await db
                .get()
                .collection(collection.USERS_COLLECTION)
                .findOne({
                    $or: [{ email: userData.email }, { phone: userData.phone }],
                });
            if (cart) {
                if (cart.email == userData.email) {
                    resolve({ signup_status: false });
                } else if (cart.phone == userData.phone) {
                    resolve({ signup_status: false });
                }
            } else {
                var userDetails = {
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    phone: userData.phone,
                    email: userData.email,
                    password: userData.password,
                    status: "user",
                    active: "true",
                    created: new Date(),
                };

                db.get()
                    .collection(collection.USERS_COLLECTION)
                    .insertOne(userDetails)
                    .then((userDetails) => {
                        resolve(userDetails.ops[0]);
                    });
            }
        });
    },

    /* Login For Users(customers)
    ============================================= */
    doLogin_User: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}; //null object created
            // let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ email: userData.email });
            let user = await db
                .get()
                .collection(collection.USERS_COLLECTION)
                .findOne({ $or: [{ email: userData.email }, { phone: userData.email }] });
            if (user) {
                bcrypt.compare(userData.password, user.password).then((loginStatus) => {
                    if (loginStatus) {
                        response.user = user;
                        response.loginStatus = true;

                        if (user.active == "blocked") {
                            response.loginStatus = "blocked";
                        }
                        resolve(response);
                    } else {
                        resolve({ loginStatus: false });
                    }
                });
            } else {
                resolve({ status: false });
            }
        });
    },

    doLogin_UserbyPhone: (phone) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}; //null object created
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ phone: phone });

            if (user) {
                response.user = user;
                response.loginStatus = true;
                resolve(response);
            } else {
                resolve({ status: false });
            }
        });
    },

    /* Check Email Registered or Not For Customers
    ============================================= */
    check_Useremail_Exist: (userEmail) => {
        let signup_status = true;

        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ email: userEmail });

            if (user) {
                resolve({ signup_status: false });
            } else {
                resolve({ signup_status: true });
            }
        });
    },

    /* Check Phone Number Registered or Not For Customers
    ============================================= */
    check_Userphone_Exist: (userPhone) => {
        let signup_status = true;
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ phone: userPhone });

            if (user) {
                resolve({ signup_status: false });
            } else {
                resolve({ signup_status: true });
            }
        });
    },

    /* Get  User/Customer Details by id 
    ============================================= */
    get_UserDetails: (userId) => {
        return new Promise(async(resolve, reject) => {

            let user = await db
            .get()
            .collection(collection.USERDETAILS_COLLECTION)
            .findOne({ user_id: objectId(userId) })
        if (user) {
            user_details = await db.get()  
                .collection(collection.USERS_COLLECTION)
                .aggregate([
                    {
                        $match: { _id: objectId(userId) },
                    },  
                    {
                        $lookup: {
                            from: collection.USERDETAILS_COLLECTION,
                            localField: "_id",
                            foreignField: "user_id",
                            as: "user",
                        }
                    },
                    {           
                        $unwind: "$user",
                    },
                    {
                        $project: {
                            first_name:1,
                            last_name:1,
                            email:1,
                            users: { $arrayToObject: "$user" },
                            // address: "$user.address",
                            // state: "$user.state",
                            // city: "$user.city",
                        },
                    },
                
            ]).toArray()
            resolve(user_details)
            console.log(user_details)
        }
        else{
         
            let user_details = await db
            .get()
            .collection(collection.USERS_COLLECTION)
            .findOne({ _id: objectId(userId) })
            resolve(user_details)
            console.log(user_details)
        }





// console.log("hiiiiiiiii")
//            let user =await db.get()
//                 .collection(collection.USERDETAILS_COLLECTION)
//                 .find({ user_id: objectId(userId) })
//                 .toArray();
//                 console.log("user:",user)
//             let user_details ={}
//              if(user){
//                 console.log("hdfggg11:",user_details)
//                  user_details = await db
//                 .get()
//                 .collection(collection.USERS_COLLECTION)
//                 .aggregate([
//                     {
//                         $match: { _id: objectId(userId) },
//                     },               
//                     {
//                         $lookup: {
//                             from: collection.USERDETAILS_COLLECTION,
//                             localField: "_id",
//                             foreignField: "user_id",
//                             as: "user",
//                         },
//                     },
//                     {
//                         $unwind: "$user",
//                     }
                  
//                 ]).toArray()
              
//              }
//              else{
//                 console.log("hii111:",user_details)
//                 user_details = await db
//                 .get()
//                 .collection(collection.USERS_COLLECTION)
//                 .aggregate([
//                     {
//                         $match: { _id: objectId(userId) },
//                     },               
                  
                  
//                 ]).toArray()
//                 console.log("hii:",user_details)
//              }
//              resolve(user_details);

//             console.log(user_details)
        });
    },

    /* Change Password  For Users
    ============================================= */
    change_Password_User: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}; //null object created
            userId = userData.user_id;
            let user = await db
                .get()
                .collection(collection.USERS_COLLECTION)
                .findOne({ _id: objectId(userId) });
            if (user) {
                userData.password = await bcrypt.hash(userData.new_password, 10);
                //   console.log();
                bcrypt.compare(userData.old_password, user.password).then((loginStatus) => {
                    if (loginStatus) {
                        db.get()
                            .collection(collection.USERS_COLLECTION)
                            .updateOne(
                                { _id: objectId(userId) },
                                {
                                    $set: {
                                        password: userData.password,
                                    },
                                }
                            );
                        response.resetStatus = true;
                        resolve(response);
                    } else {
                        resolve({ resetStatus: false });
                    }
                });
            } else {
                resolve({ resetStatus: "Not a registered user" });
            }
        });
    },

    /* Get All Customers
    ============================================= */
    get_AllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USERS_COLLECTION).find({ active: "true" }).toArray();
            resolve(users);
        });
    },

    /* Get All Customers
    ============================================= */
    get_AllBlocked_Users: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USERS_COLLECTION).find({ active: "blocked" }).toArray();

            resolve(users);
        });
    },

    /* Delete User
    ============================================= */
    delete_User: (userId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.USERS_COLLECTION)
                .update(
                    { _id: objectId(userId) },
                    {
                        $set: {
                            active: "false",
                        },
                    }
                )
                .then((user) => {
                    resolve(user);
                });
            // .catch(err => {
            //     console.error(err)
            //   })
        });
    },

    /* Block User
    ============================================= */
    block_User: (userId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.USERS_COLLECTION)
                .update(
                    { _id: objectId(userId) },
                    {
                        $set: {
                            active: "blocked",
                        },
                    }
                )
                .then((user) => {
                    resolve(user);
                });
            // .catch(err => {
            //     console.error(err)
            //   })
        });
    },

    /* Unblock User
    ============================================= */
    Unblock_User: (userId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.USERS_COLLECTION)
                .update(
                    { _id: objectId(userId) },
                    {
                        $set: {
                            active: "true",
                        },
                    }
                )
                .then((user) => {
                    resolve(user);
                });
            // .catch(err => {
            //     console.error(err)
            //   })
        });
    },

    /* Add/Update User Profile
    ============================================= */
    add_User_Profile: (userData,userId) => {
        console.log("profile helper")
        let status = true;
        return new Promise(async (resolve, reject) => {
            db.get()
            .collection(collection.USERS_COLLECTION)
            .updateOne(
                { _id: objectId(userId) },
                {
                    $set: {
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                       
                    },
                }
            )
            let user = await db
                .get()
                .collection(collection.USERDETAILS_COLLECTION)
                .findOne({ user_id: objectId(userId) });
            if (user) {              
                db.get()
                .collection(collection.USERDETAILS_COLLECTION)
                .updateOne(
                    { user_id: objectId(userId) },
                    {
                        $set: {
                            address: userData.address,
                            city: userData.city,
                            postcode: userData.postcode,
                            state: userData.state,
                        },
                    }
                )
                .then((response) => {
                    resolve({ update_status: true });
                });
                
            } else {
                console.log("user no  exist")
                var userDetails = {
                    user_id:objectId(userId),
                    address: userData.address,
                    city: userData.city,  
                    postcode: userData.postcode,  
                    state: userData.state,
                    status: 1,
                    created: new Date(),
                };

                db.get()
                    .collection(collection.USERDETAILS_COLLECTION)
                    .insertOne(userDetails)
                    .then((userDetails) => {
                        resolve(userDetails.ops[0]);
                    });
            }
        });
    },

    /*=============================            Cart Section          ============================== */

    /* products added to cart
    ============================================= */
    add_ToCart: (prodetails, userId) => {
        proId = prodetails.product_id;
        ven_id = prodetails.ven_id;
        let proObj = {
            item: objectId(proId),
            ven_id: objectId(ven_id),
            quantity: 1,
            order_status: "pending",
            date_added: new Date(),
            date_modified: new Date(),
        };
        return new Promise(async (resolve, reject) => {
            let userCart = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ user: objectId(userId) });
            if (userCart) {
                let proExist = userCart.products.findIndex((product) => product.item == proId);
                // console.log(proExist)
                if (proExist != -1) {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne(
                            { user: objectId(userId), "products.item": objectId(proId) },
                            {
                                $inc: { "products.$.quantity": 1 },
                            }
                        )
                        .then(() => {
                            resolve();
                        });
                } else {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne(
                            { user: objectId(userId) },
                            {
                                $push: { products: proObj },
                            }
                        )
                        .then((response) => {
                            resolve();
                        });
                    // .then(() => {
                    //     res.status(200).send({message: "product added to cart"});
                    //     }).catch(err => {
                    //         res.status(500).send(err);
                    //     });
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj],
                };

                db.get()
                    .collection(collection.CART_COLLECTION)
                    .insertOne(cartObj)
                    .then((response) => {
                        resolve();
                    });
            }
        });
    },

    /*Get product details from cart by userid
    ============================================= */
    get_CartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let userCart = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ user: objectId(userId) });
            if (userCart) {
                let cartItems = await db
                    .get()
                    .collection(collection.CART_COLLECTION)
                    .aggregate([
                        {
                            $match: { user: objectId(userId) },
                        },
                        {
                            $unwind: "$products",
                        },
                        {
                            $project: {
                                item: "$products.item",
                                quantity: "$products.quantity",
                                order_status: "$products.order_status",
                            },
                        },
                        {
                            $lookup: {
                                from: collection.PRODUCT_COLLECTION,
                                localField: "item",
                                foreignField: "_id",
                                as: "product",
                            },
                        },

                        {
                            $unwind: "$product",
                        },
                        {
                            $project: {
                                item: 1,
                                quantity: 1,
                                product: 1,
                                // product: { $arrayElemAt: ["$product", 0] },
                                //    product_total: "0",
                                // total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
                                // product_total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
                            },
                        },
                        // {
                        //     $set: {
                        //         price: { $toInt: "$product.price" },
                        //         product_total: { $sum: { $multiply: ["$quantity", "$product.price"] } },

                        //     }
                        // },

                        // {
                        //     $group: {
                        //         _id: null,
                        //         total: { $sum: { $multiply: ["$quantity", "$price"] } },
                        //     },
                        // },
                        // {
                        //     $set: {

                        //         product_total:{ $multiply: [ "$product.price", "$quantity" ] }

                        //     }
                        // },
                    ])
                    .toArray();
                //  console.log(cartItems);
                //resolve(cartItems[0].cartItems)
                resolve(cartItems);
            } else {
                resolve({ cart_status: false });
            }
            //  console.log(userCart)
        });
    },

    /*Get count of items in cart
    ============================================= */
    get_CartLength: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = null;
            let cart = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ user: objectId(userId) });
            if (cart) {
                count = cart.products.length;
            }
            resolve(count);
        });
    },

    /*Get  count of items in cart
    ============================================= */
    get_CartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = null;
            let cart = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ user: objectId(userId) });
            // console.log(cart)
            if (cart) {
                count = await db
                    .get()
                    .collection(collection.CART_COLLECTION)
                    .aggregate([
                        {
                            $match: { user: objectId(userId) },
                        },
                        {
                            $unwind: "$products",
                        },
                        {
                            $project: {
                                item: "$products.item",
                                quantity: "$products.quantity",
                            },
                        },
                        {
                            $lookup: {
                                from: collection.PRODUCT_COLLECTION,
                                localField: "item",
                                foreignField: "_id",
                                as: "product",
                            },
                        },
                        {
                            $project: {
                                item: 1,
                                quantity: 1,
                                product: { $arrayElemAt: ["$product", 0] },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: "$quantity" },
                            },
                        },
                    ])
                    .toArray();
                //    console.log(count)
                //console.log("total-----------------", count[0].count);
                count = count[0].count;
                // console.log("total-----------------",count);
                resolve(count);
            } else {
                count = 0;
                //console.log("total1112222-----------------",count);
                resolve(count);
            }
        });
    },

    /*Get total amount of items in cart
    ============================================= */
    get_TotalAmount: (userId) => {
        //console.log("get amount")
        return new Promise(async (resolve, reject) => {
            let cart = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ user: objectId(userId) });
            if (cart) {
                let total = await db
                    .get()
                    .collection(collection.CART_COLLECTION)
                    .aggregate([
                        {
                            $match: { user: objectId(userId) },
                        },
                        {
                            $unwind: "$products",
                        },
                        {
                            $project: {
                                item: "$products.item",
                                quantity: "$products.quantity",
                            },
                        },
                        {
                            $lookup: {
                                from: collection.PRODUCT_COLLECTION,
                                localField: "item",
                                foreignField: "_id",
                                as: "product",
                            },
                        },
                        {
                            $project: {
                                item: 1,
                                quantity: 1,
                                product: { $arrayElemAt: ["$product", 0] },
                            },
                        },
                        {
                            $set: {
                                price: { $toInt: "$product.price" },
                            },
                        },

                        {
                            $group: {
                                _id: null,
                                total: { $sum: { $multiply: ["$quantity", "$price"] } },
                            },
                        },
                    ])
                    .toArray();

                //   console.log("totallll:",total)
                // console.log("total-----------------", total[0].total);
                resolve(total[0].total);
            }
        });
    },

    /*Cahnge the product quantity
    ============================================= */
    change_ProductQuantity: (details) => {
        let count = parseInt(details.count);
        let quantity = parseInt(details.quantity);

        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get()
                    .collection(collection.CART_COLLECTION)
                    .updateOne(
                        { _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } },
                        }
                    )
                    .then((response) => {
                        resolve({ removeProduct: true });
                    });
            } else {
                db.get()
                    .collection(collection.CART_COLLECTION)
                    .updateOne(
                        { _id: objectId(details.cart), "products.item": objectId(details.product) },
                        {
                            $inc: { "products.$.quantity": count },
                        }
                    )
                    .then((response) => {
                        resolve({ status: true });
                    });
            }
        });
    },

    /*Remove item from cart
    ============================================= */
    remove_CartItem: (details) => {
        console.log("cartid:", details.cart);

        cartId = details.cart;
        return new Promise((resolve, reject) => {
            let order = db
                .get()
                .collection(collection.CART_COLLECTION)
                .aggregate([
                    {
                        $match: { _id: objectId(cartId) },
                    },
                    {
                        $project: {
                            sizeOfArray: { $size: "$products" },
                        },
                    },
                ])
                .toArray();
            order.then(function (result) {
                count = result[0].sizeOfArray;
              
                if (count > 1) {
                    //console.log("count greater");
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne(
                            { _id: objectId(details.cart) },
                            {
                                $pull: { products: { item: objectId(details.product) } },
                            }
                        )
                        .then(() => {
                            resolve();
                        });
                } else {
                   // console.log("count lesser");
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .removeOne({ _id: objectId(details.cart) })
                        .then(() => {
                            resolve();
                        });
                }
            });
        });
    },

    /*Place order details
    ============================================= */
    place_Order: (order, products, total) => {
        return new Promise((resolve, reject) => {
            let status = order["payment-method"] === "COD" ? "placed" : "pending";

            for (var i = 0; i < products.length; i++) {
                products[i].order_status = status;
            }

            let order_details = {
                deliveryDetails: {
                    billing_address: order.billing_address,
                    billing_city: order.billing_city,
                    billing_pincode: order.billing_pincode,
                    billing_state: order.billing_state,
                },
                userId: objectId(order.userId),
                paymentMethod: order["payment-method"],
                products: products,
                totalAmount: total,
                status: status,
                created_date: new Date(),
                modified_date: new Date(),
            };
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .insertOne(order_details)
                .then((response) => {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .removeOne({ user: objectId(order.userId) });
                    resolve(response.ops[0]._id);
                });
            // resolve()
        });
    },

    /*Get cart products list by user id
    ============================================= */
    get_CartProduct_List: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ user: objectId(userId) });
            resolve(cart.products);
        });
    },

    /*=============================             Order Section          ============================== */

    /*Get User Orders
    ============================================= */
    get_UserOrders_ByuserId: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find({ userId: objectId(userId) })
                .toArray();
            resolve(orders);
        });
    },

    /*Get details of ordered products
    ============================================= */
    get_OrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: { _id: objectId(orderId) },
                    },
                    {
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            item: "$products.item",
                            quantity: "$products.quantity",
                            order_status: "$products.order_status",
                            status: 1,
                        },
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },

                    {
                        $unwind: "$product",
                    },
                    {
                        $addFields: {
                           convertedPrice: { $toDecimal: "$product.price" },
                           convertedQty: { $toInt: "$quantity" },
                        }
                     },
                     {
                        $set: {
                            totalAmount:{ $multiply: [ "$convertedPrice", "$convertedQty" ] },
                        },
                    },

                    // {
                    //     $set: {
                    //         totalAmount: { $multiply: ["$product.price", "$quantity"] },
                    //     },
                    // },
                ])
                .toArray();
            //console.log("orderitems:", orderItems);
            resolve(orderItems);
        });
    },

    /*Generate razorpay details
    ============================================= */
    generate_RazorPay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100, // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId,
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    //  console.log("New Order :" ,order);
                    resolve(order);
                }
            });
        });
    },

    /*Verify Payment
    ============================================= */
    verify_Payment: (details) => {
        return new Promise((resolve, reject) => {
            //   console.log("order id:" ,details['payment[razorpay_order_id]'])
            //  console.log("paymentid:",details['payment[razorpay_payment_id]'])
            const crypto = require("crypto");
            let hmac = crypto.createHmac("sha256", "JuWZzbyfn9iNxVMLtbh1n2PQ");
            hmac.update(details["payment[razorpay_order_id]"] + "|" + details["payment[razorpay_payment_id]"]);
            hmac = hmac.digest("hex");

            if (hmac == details["payment[razorpay_signature]"]) {
                //   console.log("Payment success")
                resolve();
            } else {
                // console.log("Payment failed")
                reject();
            }
        });
    },

    /*Change the payment status of customer
    ============================================= */
    change_PaymentStatus: (orderId) => {
        
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                . updateMany(
                    { _id: objectId(orderId) },
                    {
                        $set: {
                            status: "placed",
                          //  "products.$[order_status]" :  "placed"
                           "products.$[].order_status" :"placed"                            
                        },
                    //    { $set: { "products.$[order_status]" : status } },
                    },    
                    { multi: true,
                     
                          }              
                    // { "multi": true }
                    
                )
                .then(() => {
                    resolve();
                });
        });
    },

    /*Get Vendor Orders
    ============================================= */
    get_UserOrders_ByvendorId: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            // let orders = await db
            //     .get()
            //     .collection(collection.ORDER_COLLECTION)
            //     .find({ "products.ven_id": objectId(vendorId) })
            //     .toArray();

            // console.log(orders);
            // resolve(orders);
            let orders = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $unwind: "$products",
                    },
                    {
                        $match: { "products.ven_id": objectId(vendorId) },
                    },
                    {
                        $set: {
                            created_date:{ $dateToString: { format: "%d-%m-%Y", date: "$created_date" } },
                        },
                    },
                    {
                        $group: {
                            _id: "$_id",
                            products: { $push: "$products" },
                            deliveryDetails: { $first: "$deliveryDetails" },
                            paymentMethod: { $first: "$paymentMethod" },
                            order_status: { $first: "$products.order_status" },
                           created_date: { $first: "$created_date" },
                        },
                    },
                ])
                .toArray();
            resolve(orders);
           // console.log(orders);
        });
    },

    /*Get Vendor Orders old
    ============================================= */
    get_UserOrders_ByvendorId_old: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            deliveryDetails: 1,
                            userId: 1,
                            paymentMethod: 1,
                            date: 1,
                            status: 1,
                            item: "$products.item",
                            quantity: "$products.quantity",
                        },
                    },

                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    {
                        $unwind: "$product",
                    },
                    {
                        $set: {
                            vendor_id: "$product.vendor_id",
                            totalAmount: { $multiply: ["$product.price", "$quantity"] },
                        },
                    },
                    {
                        $match: { vendor_id: objectId(vendorId) },
                    },
                ])
                .toArray();
            //console.log(orderItems)
            resolve(orderItems);
        });
    },

    /*View Order Products By Vendor Id and OrderId
    ============================================= */
    view_Order_Products_Byvendor: (vendorId, orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: { _id: objectId(orderId) },
                    },

                    {
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            deliveryDetails: 1,
                            userId: 1,
                            status: 1,
                            ven_id: "$products.ven_id",
                            item: "$products.item",
                            quantity: "$products.quantity",
                            order_status: "$products.order_status",
                        },
                    },

                    {
                        $match: { ven_id: objectId(vendorId) },
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    {
                        $lookup: {
                            from: collection.USERS_COLLECTION,
                            localField: "userId",
                            foreignField: "_id",
                            as: "users",
                        },
                    },
                    {
                        $unwind: "$product",
                    },
                    {
                        $addFields: {
                           convertedPrice: { $toDecimal: "$product.price" },
                           convertedQty: { $toInt: "$quantity" },
                        }
                     },
                     {
                        $set: {
                            totalAmount:{ $multiply: [ "$convertedPrice", "$convertedQty" ] },
                        },
                    },
                    // {
                    //     $set: {
                    //         totalAmount: { $multiply: ["$product.price", "$quantity"] },
                    //     },
                    // },
                    {
                        $unwind: "$users",
                    },
                ])
                .toArray();
             //  console.log("vendor order:",orderItems)
            resolve(orderItems);
        });
    },

    /*Change the payment status of customer by vendor id 
    ============================================= */
    change_Orderstatus_Byvendor: (details) => {
        status = details.status;
        orderId = details.order_id;
        ven_id = details.ven_id;
        console.log(ven_id);
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .update(
                    {
                        _id: objectId(orderId),
                    },

                    {
                        $set: {
                            "products.$[elem].order_status": status,
                        },
                    },
                    {
                        multi: true,
                        arrayFilters: [{ "elem.ven_id": objectId(ven_id) }],
                    }
                )
                // .update(
                //     {  _id: objectId(orderId)},
                //     { $set: { "products.$[order_status]" : status } },
                //     { multi: true,
                //         arrayFilters: [ { "element": { $gte: 100 } } ]
                //     }
                // )
                .then(() => {
                    resolve();
                });
        });
    },

    /*View Sales Report By Vendor Id 
    ============================================= */
    view_SalesReport_Byvendor: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            deliveryDetails: 1,
                            userId: 1,
                            status: 1,
                            created: { $dateToString: { format: "%m-%d-%Y", date: "$created_date" } },
                            ven_id: "$products.ven_id",
                            item: "$products.item",
                            product_name: "$products.product_name",
                            quantity: "$products.quantity",
                            order_status: "$products.order_status",
                        },
                    },

                    {
                        $match: { ven_id: objectId(vendorId) },
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    {
                        $lookup: {
                            from: collection.USERS_COLLECTION,
                            localField: "userId",
                            foreignField: "_id",
                            as: "users",
                        },
                    },
                    {
                        $unwind: "$product",
                    },
                    {
                        $addFields: {
                           convertedPrice: { $toDecimal: "$product.price" },
                           convertedQty: { $toInt: "$quantity" },
                        }
                     },
                     {
                        $set: {
                            totalAmount:{ $multiply: [ "$convertedPrice", "$convertedQty" ] },
                        },
                    },
                    // {
                    //     $set: {
                    //         totalAmount: { $multiply: ["$product.price", "$quantity"] },
                    //     },
                    // },
                    {
                        $unwind: "$users",
                    },
                ])
                .toArray();
            //    console.log("vendor order:",orderItems)
            resolve(orderItems);
        });
    },

    /*View Sales Report By Vendor Id  & Date
    ============================================= */
    view_SalesReport_ByDate_Id1: (vendorId, dates) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            deliveryDetails: 1,
                            userId: 1,
                            status: 1,
                            created_date: 1,
                            created: { $dateToString: { format: "%m-%d-%Y", date: "$created_date" } },
                            ven_id: "$products.ven_id",
                            item: "$products.item",
                            product_name: "$products.product_name",
                            quantity: "$products.quantity",
                            order_status: "$products.order_status",
                        },
                    },

                    {
                        $match: {
                            ven_id: objectId(vendorId),
                            // created_date: dates.start,
                            // created_date: dates.end
                        },
                    },
                    {
                        $group: {
                            _id: { created_date: "$created" },
                        },
                    },
                    // { $match: { date: { $gte:"$created" } } },
                    // { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_date" } } } },
                    // {$match :  { created_date:  {$eq:dates.start}}},
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    // {
                    //     $lookup: {
                    //         from: collection.USERS_COLLECTION,
                    //         localField: "userId",
                    //         foreignField: "_id",
                    //         as: "users",
                    //     },
                    // },
                    {
                        $unwind: "$product",
                    },
                    {
                        $set: {
                            totalAmount: { $multiply: ["$product.price", "$quantity"] },
                        },
                    },
                    // {
                    //     $unwind: "$users",
                    // },
                ])
                .toArray();
            console.log("vendor order:", orderItems);
            resolve(orderItems);
        });
    },

    /*View Sales Report By Vendor Id  & Date
    ============================================= */
    view_SalesReport_ByDate_Id: (vendorId, dates) => {
        start = dates.start;
        end = dates.end;
        return new Promise(async (resolve, reject) => {
            let orderItems = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            deliveryDetails: 1,
                            userId: 1,
                            status: 1,
                            created: { $dateToString: { format: "%d-%m-%Y", date: "$created_date" } },
                            created_date: { $dateToString: { format: "%Y-%m-%d", date: "$created_date" } },
                            ven_id: "$products.ven_id",
                            item: "$products.item",
                            product_name: "$products.product_name",
                            quantity: "$products.quantity",
                            order_status: "$products.order_status",
                        },
                    },
                    {
                        $match: {
                            created_date: {
                                $gte: start,
                                $lte: end,
                                // $gte: "12-02-2017", $lt: "12-31-2018"
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },

                    {
                        $unwind: "$product",
                    },
                    {
                        $addFields: {
                           convertedPrice: { $toDecimal: "$product.price" },
                           convertedQty: { $toInt: "$quantity" },
                        }
                     },
                     {
                        $set: {
                            totalAmount:{ $multiply: [ "$convertedPrice", "$convertedQty" ] },
                        },
                    },
                  
                ])
                .toArray();
            //    console.log("vendor order:",orderItems)
            resolve(orderItems);
        });
    },
};
