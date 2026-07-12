// ==========================================
// TransitOps Driver Management
// ==========================================

// Local Storage

let drivers = JSON.parse(localStorage.getItem("drivers")) || [];

let editIndex = -1;

// Elements

const addDriverBtn = document.getElementById("addDriver");
const cancelBtn = document.getElementById("cancelDriver");
const saveBtn = document.getElementById("saveDriver");

const driverBox = document.getElementById("driverBox");

const searchInput = document.getElementById("searchDriver");
const filterStatus = document.getElementById("filterStatus");

// =============================
// Show Form
// =============================

addDriverBtn.onclick = () => {

    driverBox.style.display = "block";

    document.getElementById("formTitle").innerHTML = "Add Driver";

    clearForm();

    editIndex = -1;

};

// =============================
// Hide Form
// =============================

cancelBtn.onclick = () => {

    driverBox.style.display = "none";

};

// =============================
// Save Driver
// =============================

saveBtn.onclick = function(){

    const name =
    document.getElementById("driverName").value.trim();

    const license =
    document.getElementById("licenseNo").value.trim();

    const category =
    document.getElementById("licenseCategory").value.trim();

    const expiry =
    document.getElementById("expiryDate").value;

    const mobile =
    document.getElementById("mobile").value.trim();

    const safety =
    Number(document.getElementById("safetyScore").value);

    const status =
    document.getElementById("driverStatus").value;

    // Validation

    if(
        name=="" ||
        license=="" ||
        category=="" ||
        expiry=="" ||
        mobile==""
    ){

        alert("Please fill all fields.");

        return;

    }

    if(mobile.length!=10){

        alert("Enter valid mobile number.");

        return;

    }

    if(safety<0 || safety>100){

        alert("Safety Score must be between 0-100");

        return;

    }

    // Duplicate License

    const duplicate = drivers.find((d,index)=>{

        return d.license==license && index!=editIndex;

    });

    if(duplicate){

        alert("License Number already exists.");

        return;

    }

    // Date Validation

    let today=new Date();

    today.setHours(0,0,0,0);

    let exp=new Date(expiry);

    exp.setHours(0,0,0,0);

    if(exp<today){

        alert("License Expired");

        return;

    }

    const driver={

        name,

        license,

        category,

        expiry,

        mobile,

        safety,

        status

    };

    if(editIndex==-1){

        drivers.push(driver);

    }

    else{

        drivers[editIndex]=driver;

    }

    localStorage.setItem(

        "drivers",

        JSON.stringify(drivers)

    );

    clearForm();

    driverBox.style.display="none";

    renderDrivers();

};









// ==========================================
// Render Driver Table
// ==========================================

function renderDrivers() {

    const tbody = document.querySelector("#driverTable tbody");

    tbody.innerHTML = "";

    let filtered = drivers.filter(driver => {

        let searchMatch =
            driver.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            driver.license.toLowerCase().includes(searchInput.value.toLowerCase());

        let statusMatch =
            filterStatus.value == "" ||
            driver.status == filterStatus.value;

        return searchMatch && statusMatch;

    });

    if(filtered.length==0){

        tbody.innerHTML=`

        <tr>

            <td colspan="8" class="empty">

                No Drivers Found

            </td>

        </tr>

        `;

        return;

    }

    filtered.forEach((driver,index)=>{

        let scoreClass="high";

        if(driver.safety<80){

            scoreClass="medium";

        }

        if(driver.safety<50){

            scoreClass="low";

        }

        let statusClass="available";

        switch(driver.status){

            case "On Trip":

                statusClass="trip";

                break;

            case "Off Duty":

                statusClass="off";

                break;

            case "Suspended":

                statusClass="suspended";

                break;

            default:

                statusClass="available";

        }

        tbody.innerHTML+=`

        <tr>

            <td>${driver.name}</td>

            <td>${driver.license}</td>

            <td>${driver.category}</td>

            <td>${driver.expiry}</td>

            <td>${driver.mobile}</td>

            <td>

                <span class="score ${scoreClass}">

                    ${driver.safety}

                </span>

            </td>

            <td>

                <span class="status ${statusClass}">

                    ${driver.status}

                </span>

            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editDriver(${index})">

                    Edit

                </button>

                <button
                    class="delete-btn"
                    onclick="deleteDriver(${index})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

// ==========================================
// Search
// ==========================================

searchInput.addEventListener(

    "keyup",

    renderDrivers

);

// ==========================================
// Filter
// ==========================================

filterStatus.addEventListener(

    "change",

    renderDrivers

);











// ==========================================
// Edit Driver
// ==========================================

function editDriver(index){

    editIndex = index;

    const driver = drivers[index];

    driverBox.style.display = "block";

    document.getElementById("formTitle").innerHTML = "Edit Driver";

    document.getElementById("driverName").value = driver.name;

    document.getElementById("licenseNo").value = driver.license;

    document.getElementById("licenseCategory").value = driver.category;

    document.getElementById("expiryDate").value = driver.expiry;

    document.getElementById("mobile").value = driver.mobile;

    document.getElementById("safetyScore").value = driver.safety;

    document.getElementById("driverStatus").value = driver.status;

}


// ==========================================
// Delete Driver
// ==========================================

function deleteDriver(index){

    if(confirm("Are you sure you want to delete this driver?")){

        drivers.splice(index,1);

        localStorage.setItem(

            "drivers",

            JSON.stringify(drivers)

        );

        renderDrivers();

    }

}


// ==========================================
// Clear Form
// ==========================================

function clearForm(){

    document.getElementById("driverName").value="";

    document.getElementById("licenseNo").value="";

    document.getElementById("licenseCategory").value="";

    document.getElementById("expiryDate").value="";

    document.getElementById("mobile").value="";

    document.getElementById("safetyScore").value="";

    document.getElementById("driverStatus").selectedIndex=0;

}


// ==========================================
// Initial Load
// ==========================================

renderDrivers();