// ===========================================
// TransitOps Reports & Analytics
// ===========================================

// LocalStorage Data
const vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
const drivers = JSON.parse(localStorage.getItem("drivers")) || [];
const trips = JSON.parse(localStorage.getItem("trips")) || [];
const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// =============================
// KPI Cards
// =============================

document.getElementById("vehicleCount").innerHTML = vehicles.length;

document.getElementById("driverCount").innerHTML = drivers.length;

document.getElementById("tripCount").innerHTML =
trips.filter(t => t.status === "Dispatched").length;

let totalExpense = 0;

expenses.forEach(exp => {

    totalExpense += Number(exp.total);

});

document.getElementById("expenseTotal").innerHTML =
"₹ " + totalExpense.toLocaleString();

// =============================
// Fleet Utilization
// =============================

const activeVehicles =
vehicles.filter(v => v.status === "On Trip").length;

const fleetUtilization =
vehicles.length == 0
? 0
: Math.round((activeVehicles / vehicles.length) * 100);

document.getElementById("fleetUtilization").innerHTML =
fleetUtilization + "%";

// =============================
// Fuel Efficiency
// =============================

let totalDistance = 0;
let totalFuel = 0;

trips.forEach(t => {

    totalDistance += Number(t.distance || 0);

});

expenses.forEach(exp => {

    totalFuel += Number(exp.fuelLiter || 0);

});

const fuelEfficiency =
totalFuel == 0
? 0
: (totalDistance / totalFuel).toFixed(2);

document.getElementById("fuelEfficiency").innerHTML =
fuelEfficiency + " KM/L";

// =============================
// Operational Cost
// =============================

document.getElementById("operationalCost").innerHTML =
"₹ " + totalExpense.toLocaleString();

// =============================
// Vehicle ROI
// =============================

let acquisitionCost = 0;

vehicles.forEach(v => {

    acquisitionCost += Number(v.cost || 0);

});

const roi =
acquisitionCost == 0
? 0
: (((totalExpense - acquisitionCost) / acquisitionCost) * 100).toFixed(2);

document.getElementById("vehicleROI").innerHTML =
roi + "%";

// =============================
// Fleet Chart
// =============================

new Chart(

document.getElementById("fleetChart"),

{

type:"bar",

data:{

labels:[
"Available",
"On Trip",
"In Shop",
"Retired"
],

datasets:[{

label:"Vehicles",

data:[

vehicles.filter(v=>v.status=="Available").length,

vehicles.filter(v=>v.status=="On Trip").length,

vehicles.filter(v=>v.status=="In Shop").length,

vehicles.filter(v=>v.status=="Retired").length

],

backgroundColor:[

"#22c55e",

"#3b82f6",

"#f59e0b",

"#ef4444"

]

}]

},

options:{

responsive:true,

plugins:{

legend:{

display:false

}

}

}

}

);

// =============================
// Expense Chart
// =============================

let fuelCost = 0;
let tollCost = 0;
let otherCost = 0;

expenses.forEach(exp=>{

fuelCost += Number(exp.fuelCost);

tollCost += Number(exp.toll);

otherCost += Number(exp.other);

});

new Chart(

document.getElementById("expenseChart"),

{

type:"doughnut",

data:{

labels:[
"Fuel",
"Toll",
"Other"
],

datasets:[{

data:[

fuelCost,

tollCost,

otherCost

],

backgroundColor:[

"#3b82f6",

"#22c55e",

"#f59e0b"

]

}]

},

options:{

responsive:true

}

}

);

// =============================
// Export CSV
// =============================

document
.getElementById("exportCSV")
.onclick=function(){

let csv="Vehicle,Date,Fuel Cost,Toll,Other,Total\n";

expenses.forEach(exp=>{

csv+=

`${exp.vehicle},
${exp.date},
${exp.fuelCost},
${exp.toll},
${exp.other},
${exp.total}\n`;

});

const blob =
new Blob([csv],{

type:"text/csv"

});

const url =
URL.createObjectURL(blob);

const a =
document.createElement("a");

a.href=url;

a.download="TransitOps_Report.csv";

a.click();

URL.revokeObjectURL(url);

};