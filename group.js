var admin = require("firebase-admin");
var FCM = require('fcm-node');

var serviceAccount = require("C:/Users/Revel Soft 03/Documents/GitHub/NODEJS/usabai3.json");
//var serviceAccount = require("C:/Users/Maxky_2208/Documents/GitHub/NODEJS/NodeJs/usabai3.json");

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


// As an admin, the app has access to read and write all data, regardless of Security Rules
var count;
var isExit = false;
main_();


setInterval((function () {

    if (isExit == false) {
        console.log('I\'m Batman!');
        isExit = true;
    } else {
        process.exit();
    }
}), 5 * 60 * 1000);




function main_2() {
    var db = admin.database();
    var setiting = db.ref("event_customer/").limitToLast(1);
    setiting.on("value", function (time) {
        time.forEach(function (emp_list) {
        set3 = emp_list.key;
        console.log(set3);
        });
        
    });
  
}

function main_() {
    var db = admin.database();
    var set1 = 0;
    var set2 = 0;
    var set3 = 0;


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
    var employee_owner = db.ref("employee/");
    var employee_team = db.ref("employee/");
    var customerData = db.ref("event_customer/");
    var notification = db.ref("notifications/");

    //---- เช็คการแจ้งเตือน ที่ยังไม่ถูกเปิดอ่าน เกินเวลาที่กำหนด
    notification.on("value", function (not) {
        var not_late = 0;
        //console.log("ss",set3)
        not.forEach(function (not_list) {
          //  console.log(sumday(not_list.val().notifications_full_time))
            if (not_list.val().seen == "0" && diffDays2(not_list.val().notifications_time) < set3) {
                not_late++;
            }

            console.log("emp", not_list.val().emp_username + "  not_late " + not_late);
            //---- เช็คการแจ้งเตือน ที่ยังไม่ถูกเปิดอ่าน ถ้าเกินเวลาที่กำหนด แจ้งเจ้าของบริษัท
            if (not_late > 0) {
                employee_owner.on("value", function (emp_) {
                    emp_.forEach(function (emp_list_) {

                        if (emp_list_.val().employee_type_id == "เจ้าของบริษัท") {
                            console.log(emp_list_.val().employee_tokenID)
                            var registrationToken_o = emp_list_.val().employee_tokenID;
                            var message = {
                                to: registrationToken_o,
                                notification: {
                                    title: 'คุณ' + not_list.val().emp_username,
                                    body: 'ไม่เปิดอ่านการแจ้งเตื่อนเกินเวลาที่กำหนด',
                                    sound: "default",
                                    click_action: "FCM_PLUGIN_ACTIVITY",
                                    icon: "fcm_push_icon"
                                },

                                data: {  //you can send only notification or only data(or include both)
                                    cus_key: emp_list_.val().notifications_key,
                                    type: "late_owner",
                                    // index: "",
                                    emp_name: emp_list_.val().employee_username,
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
                            } else if (date1 == date_now) {

                            }

                        }
                    })
                })

            }
        });
    });
    //END---- เช็คการแจ้งเตือน ที่ยังไม่ถูกเปิดอ่าน เกินเวลาที่กำหนด

    employee.on("value", function (emp) {
        //วน พนักงานแต่ละคน
        emp.forEach(function (emp_list) {
            var ok = 0;
            var near = 0;
            var late = 0;
            //วน ลูกค้าของพนักงานแต่ละรอบ(หาลูกค้าที่ใกล้เกินกำหนดการแจ้งเตือน)
            customerData.on("value", function (cus) {
                cus.forEach(function (cus_list) {
                    if (cus_list.val().employee_username == emp_list.val().employee_username && diffDays2(cus_list.val().z_status_latest_date) < (set1 - set2)) {
                        ok++;
                    } else if (cus_list.val().employee_username == emp_list.val().employee_username && diffDays2(cus_list.val().z_status_latest_date) < set1) {
                        near++;
                    } else if (cus_list.val().employee_username == emp_list.val().employee_username && diffDays2(cus_list.val().z_status_latest_date) > set1) {
                        late++;
                    }

                });
                console.log("emp", emp_list.val().employee_username + "  ok " + ok);
                console.log("emp", emp_list.val().employee_username + "  near " + near);
                console.log("emp", emp_list.val().employee_username + "  late " + late);
                //วน ลูกค้าของพนักงานแต่ละรอบ(ถ้าใกล้หมดเวลากำหนด)
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

                //วน ลูกค้าของพนักงานแต่ละรอบ(ถ้าเกินเวลากำหนด*แจ้งหัวหน้า)
                if (late > 0) {
                    var registrationToken = emp_list.val().employee_tokenID;
                    var message = {
                        to: registrationToken,
                        notification: {
                            title: 'คุณมีลูกค้าที่ขาดการติดตามเกินกำหนดเวลา',
                            body: 'จำนวน ' + late + ' คน',
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


                    employee_team.on("value", function (emp_team) {
                        emp_team.forEach(function (emp_team_list) {
                            console.log("team", emp_team_list.val().employee_team_id)
                            if (emp_team_list.val().employee_team_id == emp_list.val().employee_team_id && emp_team_list.val().employee_team_sub == "หัวหน้าทีม") {
                                var registrationToken_H = emp_team_list.val().employee_tokenID;
                                var message = {
                                    to: registrationToken_H,
                                    notification: {
                                        title: 'ลูกทีม' + emp_list.val().employee_username + " ขาดการติดต่อ ",
                                        body: 'ลูกค้านวน ' + late + ' คน',
                                        sound: "default",
                                        click_action: "FCM_PLUGIN_ACTIVITY",
                                        icon: "fcm_push_icon"
                                    },

                                    data: {  //you can send only notification or only data(or include both)
                                        //cus_key: "",
                                        type: "team",
                                        // index: "",
                                        emp_name: emp_list.val().employee_username,
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
                                } else if (date1 == date_now) {
                                    //process.exit(-1);
                                }

                            }
                        })
                    })

                }
            });
            //END---- ลูกค้าของพนักงานแต่ละรอบ(หาลูกค้าที่ใกล้เกินกำหนดการแจ้งเตือน)
            var app = 0;
            var not_visit = db.ref("notifications-visit/" + emp_list.val().employee_username + '/');
            not_visit.on("value", function (vis) {
                vis.forEach(function (vis_list) {
                    if (diffDays(vis_list.val().date) == 0) {
                        app++;
                    }
                });
            });
            var not_transfer = db.ref("notifications-transfer/" + emp_list.val().employee_username + '/');
            not_transfer.on("value", function (tra) {
                tra.forEach(function (tra_list) {
                    if (diffDays(tra_list.val().date) == 0) {
                        app++;
                    }
                });
            });
            var not_reservation = db.ref("notifications-reservation/" + emp_list.val().employee_username + '/');
            not_reservation.on("value", function (res) {
                res.forEach(function (res_list) {
                    if (diffDays(res_list.val().date) == 0) {
                        app++;
                    }
                });
                console.log("app", emp_list.val().employee_username + "  app " + app);
                if (app > 0) {
                    var registrationToken = emp_list.val().employee_tokenID;
                    var message = {
                        to: registrationToken,
                        notification: {
                            title: 'วันนี้คุณมีนัดลูกค้า',
                            body: 'จำนวน ' + app + ' คน',
                            sound: "default",
                            click_action: "FCM_PLUGIN_ACTIVITY",
                            icon: "fcm_push_icon"
                        },

                        data: {
                            //cus_key: "",
                            type: "appoint",
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
            });

        });
        //END---- รอบพนักงาน


    });


}
function Notification_Appoint() {
    var visit = db.ref("notifications-visit/");
    var reservation = db.ref("notifications-reservation/");
    var reservation = db.ref("notifications-reservation/");
}

function   diffDays(date_input) {
    var date = new Date();
    var date_format = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    var date_now = new Date(date_format);
    var date = new Date(date_input)
    var timeDiff = Math.abs(date_now.getTime() - date.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
  }
function sumday(date_b) {
    var date_now = new Date();
    var date = new Date(date_b)
    var timeDiff = Math.abs(date_now.getTime() - date.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
}

function diffDays2(date_b) {
    let date_get = date_b;
    let sub_date = date_get.substring(3, 5) + '-' + date_get.substring(0, 2) + '-' + date_get.substring(6, 10);
    var date_now = new Date();
    var date_format = date_now.getFullYear() + '-' + ('0' + (date_now.getMonth() + 1)).slice(-2) + '-' + ('0' + date_now.getDate()).slice(-2);
    var date_now_ = new Date(date_format);
    var date_base = new Date(sub_date);
    var timeDiff = Math.abs(date_now_.getTime() - date_base.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
  }