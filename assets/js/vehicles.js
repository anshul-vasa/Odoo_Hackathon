// ==========================================
// TransitOps Vehicle Registry
// ==========================================

// Local Storage

let vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];

let editIndex = -1;

// Elements

const addVehicleBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancel");
const saveBtn = document.getElementById("save");

const vehicleForm = document.getElementById("vehicleForm");

const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");

// =============================
// Show Form
// =============================

addVehicleBtn.onclick = () => {

    vehicleForm.style.display = "block";

    document.getElementById("title").innerHTML = "Add Vehicle";

    clearForm();

    editIndex = -1;

};

// =============================
// Hide Form
// =============================

cancelBtn.onclick = () => {

    vehicleForm.style.display = "none";

};

// =============================
// Save Vehicle
// =============================

saveBtn.onclick = function(){

    const regNo =
    document.getElementById("regNo").value.trim().toUpperCase();

    const model =
    document.getElementById("model").value.trim();

    const type =
    document.getElementById("type").value;

    const capacity =
    document.getElementById("capacity").value;

    const odometer =
    document.getElementById("odometer").value;

    const status =
    document.getElementById("status").value;

    // Validation

    if(
        regNo=="" ||
        model=="" ||
        capacity=="" ||
        odometer==""
    ){

        alert("Please fill all fields.");

        return;

    }

    // Duplicate Registration

    const duplicate = vehicles.find((v,index)=>{

        return v.regNo==regNo && index!=editIndex;

    });

    if(duplicate){

        alert("Registration Number already exists.");

        return;

    }

    // Registration Format

    const pattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;

    if(!pattern.test(regNo)){

        alert("Invalid Registration Number");

        return;

    }

    // Capacity Validation

    if(Number(capacity)<=0){

        alert("Invalid Capacity");

        return;

    }

    // Odometer Validation

    if(Number(odometer)<0){

        alert("Invalid Odometer");

        return;

    }

    const vehicle={

        regNo,

        model,

        type,

        capacity,

        odometer,

        status

    };

    if(editIndex==-1){

        vehicles.push(vehicle);

    }

    else{

        vehicles[editIndex]=vehicle;

    }

    localStorage.setItem(

        "vehicles",

        JSON.stringify(vehicles)

    );

    clearForm();

    vehicleForm.style.display="none";

    renderVehicles();

};





// ==========================================
// Render Vehicle Table
// ==========================================

function renderVehicles() {

    const tbody = document.querySelector("#vehicleTable tbody");

    tbody.innerHTML = "";

    let filtered = vehicles.filter(vehicle => {

        let searchMatch =
            vehicle.regNo.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchInput.value.toLowerCase());

        let statusMatch =
            statusFilter.value == "" ||
            vehicle.status == statusFilter.value;

        return searchMatch && statusMatch;

    });

    if(filtered.length == 0){

        tbody.innerHTML = `

        <tr>

            <td colspan="7" class="empty">

                No Vehicles Found

            </td>

        </tr>

        `;

        return;

    }

    filtered.forEach(vehicle => {

        const originalIndex = vehicles.findIndex(v => v.regNo === vehicle.regNo);

        let statusClass = "available";

        switch(vehicle.status){

            case "On Trip":
                statusClass = "trip";
                break;

            case "In Shop":
                statusClass = "shop";
                break;

            case "Retired":
                statusClass = "retired";
                break;

            default:
                statusClass = "available";

        }

        tbody.innerHTML += `

        <tr>

            <td>${vehicle.regNo}</td>

            <td>${vehicle.model}</td>

            <td>${vehicle.type}</td>

            <td>${vehicle.capacity} KG</td>

            <td>${vehicle.odometer} KM</td>

            <td>

                <span class="status ${statusClass}">

                    ${vehicle.status}

                </span>

            </td>

            <td>

                <button
                class="edit-btn"
                onclick="editVehicle(${originalIndex})">

                Edit

                </button>

                <button
                class="delete-btn"
                onclick="deleteVehicle(${originalIndex})">

                Delete

                </button>

            </td>

        </tr>

        `;

    });

}

// ==========================================
// Edit Vehicle
// ==========================================

function editVehicle(index){

    editIndex = index;

    const vehicle = vehicles[index];

    vehicleForm.style.display = "block";

    document.getElementById("title").innerHTML = "Edit Vehicle";

    document.getElementById("regNo").value = vehicle.regNo;
    document.getElementById("model").value = vehicle.model;
    document.getElementById("type").value = vehicle.type;
    document.getElementById("capacity").value = vehicle.capacity;
    document.getElementById("odometer").value = vehicle.odometer;
    document.getElementById("status").value = vehicle.status;

}

// ==========================================
// Delete Vehicle
// ==========================================

function deleteVehicle(index){

    if(confirm("Delete this vehicle?")){

        vehicles.splice(index,1);

        localStorage.setItem(

            "vehicles",

            JSON.stringify(vehicles)

        );

        renderVehicles();

    }

}

// ==========================================
// Clear Form
// ==========================================

function clearForm(){

    document.getElementById("regNo").value = "";
    document.getElementById("model").value = "";
    document.getElementById("capacity").value = "";
    document.getElementById("odometer").value = "";

    document.getElementById("type").selectedIndex = 0;
    document.getElementById("status").selectedIndex = 0;

}

// ==========================================
// Search & Filter
// ==========================================

searchInput.addEventListener("keyup", renderVehicles);

statusFilter.addEventListener("change", renderVehicles);

// ==========================================
// Initial Load
// ==========================================

renderVehicles();