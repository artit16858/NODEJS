var admin = require("firebase-admin");
var FCM = require('fcm-node');

var serviceAccount = require("C:/Users/Revel Soft 03/Documents/GitHub/NODEJS/usabai.json");
/* var database = firebase.database(); */

var fcm = new FCM(serviceAccount);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://usabai2-19ff7.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules

var db = admin.database();
var set1 = 0;
var set2 = 0;
var set3 = 0;

/* var date1 = new Date("Wed Jan 24 2018 10:20:35 GMT+0700 (SE Asia Standard Time)")
var data2 = new Date();
console.log("2", date_now.getTime()) */
/* console.log("1",date1.getTime());
console.log("s",date1.getTime()-date_now.getTime());
 */
function sumday(date_b) {
    var date_now = new Date();
    var date = new Date(date_b)
    var timeDiff = Math.abs(date_now.getTime() - date.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
}


var setiting = db.ref("setting-time/setting/");
setiting.on("value", function (time) {
    // console.log("set", time.val());
    //  console.log("set1", time.val().setting_time1);
    // console.log("set2", time.val().setting_time2);
    //  console.log("set3", time.val().setting_time3);
    set1 = time.val().setting_time1;
    set2 = time.val().setting_time2;
    set3 = time.val().setting_time3;
});

var customerData = db.ref("event_customer/");
var customerData2 = db.ref("event_customer/");
var emp_team = db.ref("employee/");
//customerData.orderByChild("employee_username").equalTo("test").on("value", function (cus) {
customerData.on("value", function (cus) {
    var i = 0

    var deadline = set1; //หมดเวลา
    var near = set1 - set2 + 1

    cus.forEach(function (cus_list) {
        if (sumday(cus_list.val().z_status_latest_date_full) < 5) {

        } else if (sumday(cus_list.val().z_status_latest_date_full) <= 7) {

            var emp = db.ref("employee/" + cus_list.val().employee_username + "/");
            emp.on("value", function (emp_data) {
                // This registration token comes from the client FCM SDKs.

                var registrationToken = emp_data.val().employee_tokenID;

                console.log(i + " name", cus_list.val().employee_username)
                console.log(i + " cus", cus_list.key)
                console.log(i + " token", registrationToken)

                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    to: registrationToken,
                    notification: {
                        title: 'คุณมีลูกค้าที่ใกล้ครบกำหนดการติดตาม',
                        body: 'ลูกค้าคุณ ' + cus_list.val().customer_name,
                        sound: "default",
                        click_action: "FCM_PLUGIN_ACTIVITY",
                        icon: "fcm_push_icon"
                    },

                    data: {  //you can send only notification or only data(or include both)
                        //cus_key: "",
                        type: "time",
                        // index: "",
                        //emp_name: "",
                        cus_name: cus_list.key
                    }
                };

                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log("Something has gone wrong!");
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                });
            });




        } else {

        }
        i++

    });
});
customerData2.on("value", function (cus2) {


    cus2.forEach(function (cus_list2) {
        if (sumday(cus_list2.val().z_status_latest_date_full) < 5) {

        } else if (sumday(cus_list2.val().z_status_latest_date_full) > 7) {
            var emps = db.ref("employee/" + cus_list2.val().employee_username + "/");
            emps.on("value", function (emp_data_s) {


                emp_team.on("value", function (emp_team_data) {
                    emp_team_data.forEach(function (emp_team_list) {

                        if (emp_team_list.val().employee_team_id == emp_data_s.val().employee_team_id && emp_team_list.val().employee_team_sub == "หัวหน้าทีม") {
                            var registrationToken = emp_team_list.val().employee_tokenID;

                            console.log( " name2", emp_team_list.val().employee_username)
                            console.log( " cus2", cus_list2.key)
                            console.log( " token2", registrationToken)

                            var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                                to: registrationToken,
                                // collapse_key: 'your_collapse_key',

                                notification: {
                                    title: 'ลูกทีมssdsd' + emp_data.val().customer_name,
                                    body: 'ลูกค้าคุณ ' + cus_list.val().customer_name,
                                    sound: "default",
                                    click_action: "FCM_PLUGIN_ACTIVITY",
                                    icon: "fcm_push_icon"
                                },

                                data: {  //you can send only notification or only data(or include both)
                                    //cus_key: "",
                                    type: "time",
                                    // index: "",
                                    //emp_name: "",
                                    cus_name: cus_list.key
                                }
                            };

                            fcm.send(message, function (err, response) {
                                if (err) {
                                    console.log("Something has gone wrong!");
                                } else {
                                    console.log("Successfully sent with response: ", response);
                                }
                            });
                        }

                    })

                })
             

            });
        } else {

        }
    

    });

});


