const rows = 7;
const start_time = 8;
const cols_expected = 40;
const cols = cols_expected + start_time > 24 ? 24 - start_time : cols_expected;
let time_slot = [2 * rows * cols];
let userlist;


const places = ["明香女校", "田家炳教书院", "峰城大附属学院", "极东魔术昼寝结社", "佛拉克西纳斯", "赤壁", "不存在的战区-86"];
//rows表示地点，cols表示时间，
// cols为偶数就是${start_time+j/2}:00-${start_time+j/2}:30，奇数就是${start_time+(j-1)/2}:30-${start_time+(j+1)/2}:00

const warn = document.getElementById("warning");
const username_btn = document.querySelector("div.username button");
const username_input = document.querySelector("div.username input");
let log_flag = false;//即还没有登陆
let using_username = "";

//页面加载时，初始化timeslots
window.addEventListener("load", function () {
    const savedValue = localStorage.getItem("time_slots");
    if (savedValue) {
        get_time_slot();
    }
    else {
        for (let i = 0; i < 2 * rows * cols; i++) {
            time_slot[i] = {user: "", booker: "", visiting: ""};
            set_time_slot();
        }
    }
    set_time_color();
});

async function change_time_slot(index, state) {
    if (log_flag == false) {
        warn.style.visibility = "visible";
        return;
    }
    if (Array.isArray(index)) {
        //如果index是数组类型，则为[start_index,end_index,place]
        let start_index = index[0];
        let end_index = index[1];
        let place_index = index[2];
        //先判断有没有人访问
        let visited = false;
        for (let i = start_index + place_index * (2 * cols); i < end_index + place_index * (2 * cols); i++) {
            if (time_slot[i].visiting != "") {
                visited = true;
                break;
            }
        }
        if (visited == true) {
            change_model2();
            const userConfirmed = await showModal();
            return;
        }
        for (let i = start_index + place_index * (2 * cols); i < end_index + place_index * (2 * cols); i++) {
            time_slot[i].visiting = using_username;
        }
        set_time_slot();
        if (state == "use") {
            let success = true;
            for (let i = start_index + place_index * (2 * cols); i < end_index + place_index * (2 * cols); i++) {
                if (time_slot[i].user != "" && time_slot[i].user != using_username) {
                    success = false;
                    break;
                }
            }
            if (success == true) {
                let str1;
                let str2;
                if (start_index % 2 == 0) {
                    str1 = `${start_time + start_index / 2}:00-`;
                }
                else {
                    str1 = `${start_time + (start_index - 1) / 2}:30-`;
                }
                if (end_index % 2 == 0) {
                    str2 = `${start_time + end_index / 2}:00`;
                }
                else {
                    str2 = `${start_time + (end_index - 1) / 2}:30`;
                }
                let message = "是否要在" + str1 + str2 + `预定${places[place_index]}`;
                change_model1(message);
                const userConfirmed = await showModal();
                if (userConfirmed) {

                    for (let i = start_index + place_index * (2 * cols); i < end_index + place_index * (2 * cols); i++) {
                        time_slot[i].user = using_username;
                    }
                }
            }
            else {
                change_model3();
                const userConfirmed = await showModal();
                return;
            }
        }
        else if (state == "book") {
            let success = true;
            for (let i = start_index + place_index * (2 * cols); i < end_index + place_index * (2 * cols); i++) {
                if (time_slot[i].booker != "" && time_slot[i].booker != using_username) {
                    success = false;
                    break;
                }
            }
            if (success == true) {
                let str1;
                let str2;
                if (start_index % 2 == 0) {
                    str1 = `${start_time + start_index / 2}:00-`;
                }
                else {
                    str1 = `${start_time + (start_index - 1) / 2}:30-`;
                }
                if (end_index % 2 == 0) {
                    str2 = `${start_time + end_index / 2}:00`;
                }
                else {
                    str2 = `${start_time + (end_index - 1) / 2}:30`;
                }
                let message = "是否要在" + str1 + str2 + `候补${places[place_index]}(没预约的房间会自动预约）`;
                change_model1(message);
                const userConfirmed = await showModal();
                if (userConfirmed) {

                    for (let i = start_index + place_index * (2 * cols); i < end_index + place_index * (2 * cols); i++) {
                        if (time_slot[i].user == "" || time_slot[i].user == using_username) {
                            time_slot[i].user = using_username;
                        }
                        else if (time_slot[i].booker == "") {
                            time_slot[i].booker = using_username;
                        }
                    }
                }
            }
            else {
                change_model4();
                const userConfirmed = await showModal();
                return;
            }
        }
        else if (state == "cancel") {

            let str1;
            let str2;
            if (start_index % 2 == 0) {
                str1 = `${start_time + start_index / 2}:00-`;
            }
            else {
                str1 = `${start_time + (start_index - 1) / 2}:30-`;
            }
            if (end_index % 2 == 0) {
                str2 = `${start_time + end_index / 2}:00`;
            }
            else {
                str2 = `${start_time + (end_index - 1) / 2}:30`;
            }
            let message = "是否要在" + str1 + str2 + `取消预定${places[place_index]}`;
            change_model1(message);
            const userConfirmed = await showModal();
            if (userConfirmed) {
                for (let i = start_index + place_index * (2 * cols); i < end_index + place_index * (2 * cols); i++) {
                    if (time_slot[i].user == using_username) {
                        if (time_slot[i].booker == "") {
                            time_slot[i].user = "";
                        }
                        else {
                            time_slot[i].user = time_slot[i].booker;
                            time_slot[i].booker = "";
                        }
                    }
                }

            }

        }
        else if (state == "cancel_book") {

            let str1;
            let str2;
            if (start_index % 2 == 0) {
                str1 = `${start_time + start_index / 2}:00-`;
            }
            else {
                str1 = `${start_time + (start_index - 1) / 2}:30-`;
            }
            if (end_index % 2 == 0) {
                str2 = `${start_time + end_index / 2}:00`;
            }
            else {
                str2 = `${start_time + (end_index - 1) / 2}:30`;
            }
            let message = "是否要在" + str1 + str2 + `取消候补${places[place_index]}`;
            change_model1(message);
            const userConfirmed = await showModal();
            if (userConfirmed) {

                for (let i = start_index + place_index * (2 * cols); i < end_index + place_index * (2 * cols); i++) {
                    if (time_slot[i].booker == using_username) {
                        time_slot[i].booker = "";
                    }
                }


            }

        }


        for (let i = start_index + place_index * (2 * cols); i < end_index + place_index * (2 * cols); i++) {
            time_slot[i].visiting = "";
        }
    }
    else {
        //如果index是number类型
        let place_index = Math.floor(index / (cols * 2));
        let time_index = index % (2 * cols);
        if (time_slot[index].user == "") {
            change_time_slot([time_index, time_index + 1, place_index], "use");
        }
        else if (time_slot[index].user == using_username) {
            change_time_slot([time_index, time_index + 1, place_index], "cancel");
        }
        else if (time_slot[index].booker == using_username) {
            change_time_slot([time_index, time_index + 1, place_index], "cancel_book");
        }
        else if (time_slot[index].booker == "") {
            change_time_slot([time_index, time_index + 1, place_index], "book");
        }
    }
    set_time_slot();
    set_time_color();
}

const p = document.getElementById("p1");
const b1 = document.getElementById("btn1");
const b2 = document.getElementById("btn2");

function change_model1(message) {
    p.innerText = message;
    b1.innerText = "是";
    b1.style.display = "inline-block";
    b2.innerText = "否";
    b2.style.display = "inline-block";
}

function change_model2() {
    p.innerText = "您要访问的房间中部分(或全部)正在被其他用户访问，请稍后";
    b1.style.display = "none";
    b2.innerText = "等待";
    b2.style.display = "inline-block";
}

function change_model3() {
    p.innerText = "您要访问的房间中部分(或全部)已被预定，请重试";
    b1.style.display = "none";
    b2.innerText = "等待";
    b2.style.display = "inline-block";
}

function change_model4() {
    p.innerText = "您要访问的房间中部分(或全部)已被候补，请重试";
    b1.style.display = "none";
    b2.innerText = "等待";
    b2.style.display = "inline-block";
}

function showModal() {
    document.getElementById("modal").style.display = "flex";
    return new Promise((resolve) => {
        resolveFunction = resolve;
    });
}

// 当用户点击按钮时，调用 resolveFunction 并关闭模态对话框
function resolvePromise(shouldContinue) {
    document.getElementById("modal").style.display = "none";
    resolveFunction(shouldContinue);
}

function reset() {
    for (let i = 0; i < 2 * rows * cols; i++) {
        time_slot[i] = {user: "", booker: "", visiting: ""};
        set_time_slot();
    }
    set_time_color();
    userlist = [];
    localStorage.setItem("user", JSON.stringify(userlist));
}

const res_btn = document.querySelector("button#reset");
res_btn.addEventListener("click", reset);

/*********************************************生成表格****************************************************/

function generateTable(rows, cols, start_time) {

    /*先实现head*/
    if (cols + start_time > 24) {
        cols = 24 - start_time;
    }

    const table_head = document.querySelector(".appointment thead");
    const TR = document.createElement("tr");
    const TH_F = document.createElement("th");
    TH_F.textContent = "地点";
    TH_F.classList.add("first_line");
    TR.appendChild(TH_F);

    for (let j = 0; j < cols; j++) {
        const TH = document.createElement("th");
        TH.textContent = `${j + start_time}:00`;
        TH.setAttribute("colspan", "2");
        TR.appendChild(TH);
    }
    table_head.appendChild(TR);

    /*再实现body*/


    const table_body = document.querySelector(".appointment tbody");
    for (let i = 0; i < rows; i++) {
        const TR = document.createElement("tr");

        // 第一列为地点编号
        const TD = document.createElement("td");
        TD.textContent = `${places[i]}`;
        TR.appendChild(TD);

        // 生成每个时间段的列
        for (let j = 0; j < 2 * cols; j++) {
            const cell = document.createElement("td");
            cell.classList.add("time_button");
            cell.addEventListener("click", function () {
                change_time_slot(i * cols * 2 + j, "");
            });
            TR.appendChild(cell);
        }

        table_body.appendChild(TR);
    }
}

/*调用函数生成table*/
generateTable(rows, cols_expected, start_time);


/******************************************生成下拉框******************************************************/
const select_place = document.getElementById("selectplace");
for (let i = 0; i < rows; i++) {
    let newOption = document.createElement("option");
    newOption.value = `${i}`;
    newOption.textContent = `${places[i]}`;
    select_place.appendChild(newOption);
}

const select_function = document.getElementById("selectfunction");

/**********************************************登录系统********************************************************/

username_btn.addEventListener("click", function () {
    if (log_flag == false) {
        //登录
        if (username_input.value == "") {
            alert("用户名不能为空");
            return;
        }
        const User = localStorage.getItem("user");
        if (User) {
            userlist = JSON.parse(localStorage.getItem("user"));
        }
        else {
            userlist = [];
        }
        if (userlist.includes(username_input.value)) {
            alert("账号已在别处登录");
            return;
        }
        //如果代码执行到此处，说明登录成功
        using_username = username_input.value;
        userlist.push(using_username);
        localStorage.setItem("user", JSON.stringify(userlist));
        warn.style.visibility = "hidden";
        username_input.setAttribute("readonly", "true");
        username_input.value = `你好，${using_username}`;
        username_input.style.border = "none";
        username_input.style.textAlign = "center";
        username_btn.innerHTML = "退出";
        log_flag = true;
        set_time_color();
    }
    else {
        userlist = JSON.parse(localStorage.getItem("user"));
        userlist.splice(userlist.indexOf(using_username), 1);
        localStorage.setItem("user", JSON.stringify(userlist));
        username_input.removeAttribute("readonly");
        username_input.value = username_input.value.substring(3);
        username_input.style.border = "1px solid #787878";
        username_input.style.textAlign = "left";
        username_btn.innerHTML = "登录";
        log_flag = false;
        using_username = "";
        set_time_color();
    }

});


/**********************************************监听器********************************************************/

function set_time_slot() {
    localStorage.setItem("time_slots", JSON.stringify(time_slot));
}

function get_time_slot() {
    time_slot = JSON.parse(localStorage.getItem("time_slots"));
}

function set_time_color() {
    const times = document.querySelectorAll("td.time_button");
    for (let i = 0; i < 2 * rows * cols; i++) {
        times[i].className = "time_button";
        if (time_slot[i].user == "") {
            times[i].className = "time_button";
        }
        else if (time_slot[i].user == using_username) {
            if (time_slot[i].booker == "") {
                times[i].classList.add("time_active");
            }
            else if (time_slot[i].booker != "") {
                times[i].classList.add("time_active_and_booked");
            }
        }
        else if (time_slot[i].user != using_username) {
            if (time_slot[i].booker == "") {
                times[i].classList.add("time_used_by_other");
            }
            else if (time_slot[i].booker == using_username) {
                times[i].classList.add("time_booked");
            }
            else {
                times[i].classList.add("time_used_and_booked");
            }
        }
    }
}


//time_slots更新时，同步到浏览器
window.addEventListener("storage", function (event) {
    if (event.key === "time_slots") {

        if (event.newValue !== event.oldValue) {
            get_time_slot();
            set_time_color();
        }
    }
});


const btn_sub = document.querySelector("button.usebtn");
btn_sub.addEventListener("click", function () {
    // 获取 time 输入框的值
    const meetingTime = document.querySelectorAll("input.meeting-time");
    let [start_hour, start_minute] = meetingTime[0].value.split(":");
    let [end_hour, end_minute] = meetingTime[1].value.split(":");
    //用字符串减去数字发生强制类型转换
    let start_index = (start_hour - start_time) * 2;
    let end_index = (end_hour - start_time) * 2;
    if (start_minute == "30") {
        start_index += 1;
    }
    if (end_minute == '30') {
        end_index += 1;
    }
    let place = parseInt(select_place.value);
    //如果只预定一个时段，两个index相差1
    change_time_slot([start_index, end_index, place], select_function.value);

});

window.addEventListener('beforeunload', function () {
    // 在这里执行一些清理操作或保存数据
    // 例如：你可以弹出一个确认框，询问用户是否离开页面
    if (log_flag == true) {
        userlist = JSON.parse(localStorage.getItem("user"))
        userlist.splice(userlist.indexOf(using_username), 1);
        localStorage.setItem("user", JSON.stringify(userlist));
    }

    for (let i = 0; i < 2 * rows * cols; i++) {
        if (time_slot[i].visiting == using_username) {
            time_slot[i].visiting = '';
        }
        set_time_slot();
    }
});
