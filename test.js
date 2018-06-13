var admin = require("firebase-admin");
var FCM = require('fcm-node');

var serviceAccount = require("C:/Users/Revel Soft 03/Documents/GitHub/NODEJS/usabai3.json");
/* var database = firebase.database(); */

var fcm = new FCM(serviceAccount);
//usabai2
/* admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://usabai2-19ff7.firebaseio.com"
}); */

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://usabai3-ef53d.firebaseio.com"
});

main_();








function main_() {
    var db = admin.database();
    var customerData = db.ref("employee/");
    customerData.on("value", function (cus) {
    console.log(cus.key);
    
    });

}