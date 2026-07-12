// =======================================
// TransitOps - Trip Management
// =======================================

let trips = JSON.parse(localStorage.getItem("trips")) || [];
let vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
let drivers = JSON.parse(localStorage.getItem("drivers")) || [];

// Elements
const vehicleSelect = document.getElementById("vehicle");
const driverSelect = document.getElementById("driver");

const cargoInput = document.getElementById("cargo");
const distanceInput = document.getElementById("distance");

const sourceInput = document.getElementById("source");
const destinationInput = document.getElementById("destination");

const capacityText = document.getElementById("capacity");
const weightText = document.getElementById("weight");

const dispatchBtn = document.getElementById("dispatchBtn");
const cancelBtn = document.getElementById("cancelBtn");


// =======================
// Load Available Vehicles
// =======================

function loadVehicles(){

vehicleSelect.innerHTML="<option value=''>Select Vehicle</option>";

vehicles
.filter(v=>v.status==="Available")
.forEach(v=>{

vehicleSelect.innerHTML+=`
<option value="${v.regNo}">
${v.regNo} - ${v.model} (${v.capacity} KG)
</option>
`;

});

}


// =======================
// Load Available Drivers
// =======================

function loadDrivers(){

driverSelect.innerHTML="<option value=''>Select Driver</option>";

drivers
.filter(d=>d.status==="Available")
.forEach(d=>{

driverSelect.innerHTML+=`
<option value="${d.driverName}">
${d.driverName}
</option>
`;

});

}


// =======================
// Capacity Validation
// =======================

vehicleSelect.addEventListener("change",()=>{

let vehicle=vehicles.find(v=>v.regNo===vehicleSelect.value);

if(vehicle){

capacityText.innerHTML=vehicle.capacity+" KG";

}

});

cargoInput.addEventListener("keyup",()=>{

weightText.innerHTML=cargoInput.value+" KG";

});


// =======================
// Dispatch Trip
// =======================

dispatchBtn.onclick=function(){

let vehicle=vehicles.find(v=>v.regNo===vehicleSelect.value);

let driver=drivers.find(d=>d.driverName===driverSelect.value);

if(
!vehicle ||
!driver ||
sourceInput.value==="" ||
destinationInput.value==="" ||
cargoInput.value==="" ||
distanceInput.value==="")
{

alert("Please fill all fields.");

return;

}


// Capacity Check

if(Number(cargoInput.value)>Number(vehicle.capacity)){

alert("Cargo exceeds vehicle capacity!");

return;

}


// Update Status

vehicle.status="On Trip";

driver.status="On Trip";

localStorage.setItem("vehicles",JSON.stringify(vehicles));

localStorage.setItem("drivers",JSON.stringify(drivers));


// Trip ID

let tripId="TR"+String(trips.length+1).padStart(3,"0");


// Save Trip

trips.push({

id:tripId,

source:sourceInput.value,

destination:destinationInput.value,

vehicle:vehicle.regNo,

driver:driver.driverName,

cargo:cargoInput.value,

distance:distanceInput.value,

status:"Dispatched"

});

localStorage.setItem("trips",JSON.stringify(trips));

renderTrips();

clearForm();

loadVehicles();

loadDrivers();

alert("Trip Dispatched Successfully");

};


// =======================
// Cancel
// =======================

cancelBtn.onclick=clearForm;


// =======================
// Live Board
// =======================

function renderTrips(){

const board=document.getElementById("tripBoard");

board.innerHTML="";

trips.forEach(trip=>{

board.innerHTML+=`

<div class="trip-card">

<div class="trip-id">
${trip.id}
</div>

<div class="trip-route">

${trip.source}

→

${trip.destination}

</div>

<div class="trip-footer">

<span class="badge dispatched">

${trip.status}

</span>

<span class="eta">

${trip.vehicle}

/

${trip.driver}

</span>

</div>

</div>

`;

});

}


// =======================
// Clear
// =======================

function clearForm(){

sourceInput.value="";
destinationInput.value="";
cargoInput.value="";
distanceInput.value="";

vehicleSelect.selectedIndex=0;
driverSelect.selectedIndex=0;

capacityText.innerHTML="0 KG";
weightText.innerHTML="0 KG";

}


// =======================
// Init
// =======================

loadVehicles();

loadDrivers();

renderTrips();