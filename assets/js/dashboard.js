// ============================
// Logged-in User
// ============================

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if(currentUser){

    document.getElementById("username").innerHTML=currentUser.name;

    document.querySelector(".role").innerHTML=currentUser.role;

}


// ============================
// Demo Data (First Run)
// ============================

if(localStorage.getItem("vehicles")==null){

const vehicles=[

{
id:1,
name:"Truck-01",
type:"Truck",
region:"North",
status:"Available"
},

{
id:2,
name:"Truck-02",
type:"Truck",
region:"West",
status:"On Trip"
},

{
id:3,
name:"Van-01",
type:"Van",
region:"South",
status:"Available"
},

{
id:4,
name:"Mini Truck",
type:"Mini",
region:"East",
status:"In Shop"
},

{
id:5,
name:"Pickup",
type:"Pickup",
region:"North",
status:"Available"
}

];

localStorage.setItem("vehicles",JSON.stringify(vehicles));

}


if(localStorage.getItem("drivers")==null){

const drivers=[

{name:"Alex",status:"On Duty"},
{name:"John",status:"On Duty"},
{name:"Emma",status:"Off Duty"},
{name:"David",status:"On Duty"}

];

localStorage.setItem("drivers",JSON.stringify(drivers));

}


if(localStorage.getItem("trips")==null){

const trips=[

{
trip:"TR001",
vehicle:"Truck-02",
driver:"Alex",
status:"On Trip",
from:"Delhi",
to:"Jaipur"
},

{
trip:"TR002",
vehicle:"Van-01",
driver:"John",
status:"Pending",
from:"Surat",
to:"Ahmedabad"
},

{
trip:"TR003",
vehicle:"Pickup",
driver:"David",
status:"Completed",
from:"Mumbai",
to:"Pune"
}

];

localStorage.setItem("trips",JSON.stringify(trips));

}



// ============================
// Load Data
// ============================

const vehicles=JSON.parse(localStorage.getItem("vehicles"));

const drivers=JSON.parse(localStorage.getItem("drivers"));

const trips=JSON.parse(localStorage.getItem("trips"));



// ============================
// KPI Cards
// ============================

document.getElementById("activeVehicles").innerHTML=vehicles.length;

document.getElementById("availableVehicles").innerHTML=

vehicles.filter(v=>v.status=="Available").length;

document.getElementById("maintenanceVehicles").innerHTML=

vehicles.filter(v=>v.status=="In Shop").length;

document.getElementById("activeTrips").innerHTML=

trips.filter(t=>t.status=="On Trip").length;

document.getElementById("pendingTrips").innerHTML=

trips.filter(t=>t.status=="Pending").length;

document.getElementById("driversOnDuty").innerHTML=

drivers.filter(d=>d.status=="On Duty").length;

const utilization=Math.round(

(trips.filter(t=>t.status=="On Trip").length/

vehicles.length)*100

);

document.getElementById("fleetUtilization").innerHTML=

utilization+"%";



// ============================
// Recent Trips Table
// ============================

let table=`

<table class="tripTable">

<tr>

<th>ID</th>

<th>Vehicle</th>

<th>Driver</th>

<th>From</th>

<th>To</th>

<th>Status</th>

</tr>

`;

trips.forEach(t=>{

table+=`

<tr>

<td>${t.trip}</td>

<td>${t.vehicle}</td>

<td>${t.driver}</td>

<td>${t.from}</td>

<td>${t.to}</td>

<td>

<span class="${t.status.replace(" ","")}">

${t.status}

</span>

</td>

</tr>

`;

});

table+="</table>";

document.querySelector(".left-panel").innerHTML=

"<h3>Recent Trips</h3>"+table;



// ============================
// Vehicle Status
// ============================

const available=vehicles.filter(v=>v.status=="Available").length;

const trip=vehicles.filter(v=>v.status=="On Trip").length;

const shop=vehicles.filter(v=>v.status=="In Shop").length;

document.querySelector(".right-panel").innerHTML=`

<h3>Vehicle Status</h3>

<div class="progressBox">

<p>Available (${available})</p>

<div class="progress">

<div class="green" style="width:${available*20}%"></div>

</div>

</div>

<div class="progressBox">

<p>On Trip (${trip})</p>

<div class="progress">

<div class="blue" style="width:${trip*20}%"></div>

</div>

</div>

<div class="progressBox">

<p>Maintenance (${shop})</p>

<div class="progress">

<div class="orange" style="width:${shop*20}%"></div>

</div>

</div>

`;