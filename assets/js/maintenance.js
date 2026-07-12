// ============================================
// TransitOps - Maintenance Module
// ============================================

let maintenance =
JSON.parse(localStorage.getItem("maintenance")) || [];

let vehicles =
JSON.parse(localStorage.getItem("vehicles")) || [];

let editIndex = -1;

// Elements

const form = document.getElementById("maintenanceForm");

const vehicleSelect = document.getElementById("vehicle");

const search = document.getElementById("search");

const statusFilter = document.getElementById("statusFilter");


// ===========================
// Show Form
// ===========================

document.getElementById("addBtn").onclick = () => {

    form.style.display = "block";

    clearForm();

    editIndex = -1;

};


// ===========================
// Cancel
// ===========================

document.getElementById("cancel").onclick = () => {

    form.style.display = "none";

};


// ===========================
// Load Available Vehicles
// ===========================

function loadVehicles(){

vehicleSelect.innerHTML =
"<option value=''>Select Vehicle</option>";

vehicles
.filter(v=>v.status=="Available")
.forEach(v=>{

vehicleSelect.innerHTML +=
`
<option value="${v.regNo}">
${v.regNo} - ${v.model}
</option>
`;

});

}


// ===========================
// Save
// ===========================

document
.getElementById("saveMaintenance")
.onclick=function(){

const vehicle =
document.getElementById("vehicle").value;

const service =
document.getElementById("serviceType").value;

const date =
document.getElementById("serviceDate").value;

const cost =
document.getElementById("cost").value;

const mechanic =
document.getElementById("mechanic").value;

const status =
document.getElementById("status").value;

const remarks =
document.getElementById("remarks").value;

if(
vehicle=="" ||
date=="" ||
cost=="" ||
mechanic==""
){

alert("Fill all fields");

return;

}

const data={

vehicle,

service,

date,

cost,

mechanic,

status,

remarks

};

if(editIndex==-1){

maintenance.push(data);

}else{

maintenance[editIndex]=data;

}

// Vehicle Status

const vehicleObj =
vehicles.find(v=>v.regNo==vehicle);

if(vehicleObj){

vehicleObj.status="In Shop";

}

localStorage.setItem(
"vehicles",
JSON.stringify(vehicles)
);

localStorage.setItem(
"maintenance",
JSON.stringify(maintenance)
);

renderTable();

loadVehicles();

form.style.display="none";

clearForm();

alert("Maintenance Saved");

};


// ===========================
// Render Table
// ===========================

function renderTable(){

const tbody =
document.querySelector("#maintenanceTable tbody");

tbody.innerHTML="";

let filtered =
maintenance.filter(item=>{

const searchMatch=
item.vehicle
.toLowerCase()
.includes(search.value.toLowerCase());

const statusMatch=
statusFilter.value=="" ||
item.status==statusFilter.value;

return searchMatch && statusMatch;

});

if(filtered.length==0){

tbody.innerHTML=
`
<tr>

<td colspan="7"
class="empty">

No Records

</td>

</tr>
`;

return;

}

filtered.forEach((item,index)=>{

let badge="pending";

if(item.status=="Completed")
badge="completed";

if(item.status=="In Progress")
badge="progress";

tbody.innerHTML+=`

<tr>

<td>${item.vehicle}</td>

<td>${item.service}</td>

<td>${item.date}</td>

<td>${item.mechanic}</td>

<td>₹ ${item.cost}</td>

<td>

<span class="badge ${badge}">
${item.status}
</span>

</td>

<td>

<button
class="edit-btn"
onclick="editMaintenance(${index})">

Edit

</button>

<button
class="complete-btn"
onclick="completeMaintenance(${index})">

Complete

</button>

<button
class="delete-btn"
onclick="deleteMaintenance(${index})">

Delete

</button>

</td>

</tr>

`;

});

}


// ===========================
// Edit
// ===========================

function editMaintenance(index){

editIndex=index;

const item=maintenance[index];

form.style.display="block";

document.getElementById("vehicle").value=item.vehicle;

document.getElementById("serviceType").value=item.service;

document.getElementById("serviceDate").value=item.date;

document.getElementById("cost").value=item.cost;

document.getElementById("mechanic").value=item.mechanic;

document.getElementById("status").value=item.status;

document.getElementById("remarks").value=item.remarks;

}


// ===========================
// Complete
// ===========================

function completeMaintenance(index){

maintenance[index].status="Completed";

const vehicle =
vehicles.find(v=>
v.regNo==
maintenance[index].vehicle
);

if(vehicle){

vehicle.status="Available";

}

localStorage.setItem(
"vehicles",
JSON.stringify(vehicles)
);

localStorage.setItem(
"maintenance",
JSON.stringify(maintenance)
);

renderTable();

loadVehicles();

}


// ===========================
// Delete
// ===========================

function deleteMaintenance(index){

if(confirm("Delete Record?")){

const vehicle =
vehicles.find(v=>
v.regNo==
maintenance[index].vehicle
);

if(vehicle){

vehicle.status="Available";

}

maintenance.splice(index,1);

localStorage.setItem(
"vehicles",
JSON.stringify(vehicles)
);

localStorage.setItem(
"maintenance",
JSON.stringify(maintenance)
);

renderTable();

loadVehicles();

}

}


// ===========================
// Clear
// ===========================

function clearForm(){

document.getElementById("serviceDate").value="";

document.getElementById("cost").value="";

document.getElementById("mechanic").value="";

document.getElementById("remarks").value="";

document.getElementById("vehicle").selectedIndex=0;

document.getElementById("serviceType").selectedIndex=0;

document.getElementById("status").selectedIndex=0;

}


// ===========================
// Search
// ===========================

search.addEventListener(
"keyup",
renderTable
);

statusFilter.addEventListener(
"change",
renderTable
);


// ===========================
// Init
// ===========================

loadVehicles();

renderTable();