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

function sumday(date_b) {
    var date_now = new Date();
    var date = new Date(date_b)
    var timeDiff = Math.abs(date_now.getTime() - date.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
}
var date = new Date();
var date_now = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() + ' ' + ('' + date.toTimeString()).slice(0, 5);

var setiting = db.ref("setting-time/setting/");
setiting.on("value", function (time) {
    set1 = time.val().setting_time1;
    set2 = time.val().setting_time2;
    set3 = time.val().setting_time3;
});

var date1 = "";
var date2 = "";
var employee = db.ref("employee/");
var employee_team = db.ref("employee/");
var customerData = db.ref("event_customer/");

employee.on("value", function (emp) {
    emp.forEach(function (emp_list) {
        var ok = 0;
        var near = 0;
        var late = 0;
        customerData.on("value", function (cus) {
            cus.forEach(function (cus_list) {
                if (cus_list.val().employee_username == emp_list.val().employee_username && sumday(cus_list.val().z_status_latest_date_full) < (set1 - set2)) {
                    ok++;
                } else if (cus_list.val().employee_username == emp_list.val().employee_username && sumday(cus_list.val().z_status_latest_date_full) < set1) {
                    near++;
                } else if (cus_list.val().employee_username == emp_list.val().employee_username && sumday(cus_list.val().z_status_latest_date_full) > set1) {
                    late++;
                }

            });
            console.log("emp", emp_list.val().employee_username + "  ok " + ok);
            console.log("emp", emp_list.val().employee_username + "  near " + near);
            console.log("emp", emp_list.val().employee_username + "  late " + late);

            if (near > 0) {
                var registrationToken = emp_list.val().employee_tokenID;
                var message = {
                    to: registrationToken,
                    notification: {
                        title: 'คุณมีลูกค้าที่ใกล้ครบกำหนดการติดตาม',
                        body: 'จำนวน ' + near + ' คน',
                        sound: "default",
                        click_action: "FCM_PLUGIN_ACTIVITY",
                        icon: "fcm_push_icon"
                    },

                    data: {
                        //cus_key: "",
                        type: "time",
                        // index: "",
                        //emp_name: "",
                        cus_name: emp_list.key
                    }
                };
                if (date2 == "" || date2 != date_now) {
                    fcm.send(message, function (err, response) {
                        if (err) {
                            console.log("Something has gone wrong!");

                        } else {
                            console.log("Successfully sent with response: ", response);
                            date2 = date_now;
                        }
                    });
                }
            }
            if (late > 0) {
                employee_team.on("value", function (emp_team) {
                    emp_team.forEach(function (emp_team_list) {
                        console.log("team", emp_team_list.val().employee_team_id)
                        if (emp_team_list.val().employee_team_id == emp_list.val().employee_team_id && emp_team_list.val().employee_team_sub == "หัวหน้าทีม") {
                            var registrationToken = emp_team_list.val().employee_tokenID;
                            var message = {
                                to: registrationToken,
                                notification: {
                                    title: 'ลูกทีม' + emp_list.val().employee_username + " ขาดการติดต่อ ",
                                    body: 'ลูกค้านวน ' + late + ' คน',
                                    sound: "default",
                                    click_action: "FCM_PLUGIN_ACTIVITY",
                                    icon: "fcm_push_icon"
                                },

                                data: {  //you can send only notification or only data(or include both)
                                    //cus_key: "",
                                    type: "time",
                                    // index: "",
                                    //emp_name: "",
                                    //  cus_name: cus_list.key
                                }
                            };


                            if (date1 == "" || date1 != date_now) {
                                fcm.send(message, function (err, response) {
                                    if (err) {
                                        console.log("Something has gone wrong!");

                                    } else {
                                        console.log("Successfully sent with response: ", response);
                                        date1 = date_now;
                                    }
                                });
                            }
                        }
                    })
                })

            }
        });
    });

});
