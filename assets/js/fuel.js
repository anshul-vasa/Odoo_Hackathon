// ============================================
// TransitOps - Fuel & Expense Module
// ============================================

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];

let editIndex = -1;

// Elements
const form = document.getElementById("fuelForm");
const vehicleSelect = document.getElementById("vehicle");
const search = document.getElementById("search");

// =========================
// Show Form
// =========================

document.getElementById("addBtn").onclick = () => {

    form.style.display = "block";

    clearForm();

    editIndex = -1;

};

// =========================
// Cancel
// =========================

document.getElementById("cancel").onclick = () => {

    form.style.display = "none";

};

// =========================
// Load Vehicles
// =========================

function loadVehicles(){

vehicleSelect.innerHTML="<option value=''>Select Vehicle</option>";

vehicles.forEach(vehicle=>{

vehicleSelect.innerHTML+=`
<option value="${vehicle.regNo}">
${vehicle.regNo} - ${vehicle.model}
</option>
`;

});

}

// =========================
// Save Expense
// =========================

document.getElementById("saveExpense").onclick=function(){

const vehicle=document.getElementById("vehicle").value;

const date=document.getElementById("date").value;

const fuelLiter=Number(document.getElementById("fuelLiter").value);

const fuelCost=Number(document.getElementById("fuelCost").value);

const toll=Number(document.getElementById("toll").value);

const other=Number(document.getElementById("other").value);

if(vehicle=="" || date==""){

alert("Please fill required fields");

return;

}

const total=fuelCost+toll+other;

const record={

vehicle,

date,

fuelLiter,

fuelCost,

toll,

other,

total

};

if(editIndex==-1){

expenses.push(record);

}else{

expenses[editIndex]=record;

}

localStorage.setItem(

"expenses",

JSON.stringify(expenses)

);

renderTable();

form.style.display="none";

clearForm();

alert("Expense Saved Successfully");

};

// =========================
// Render Table
// =========================

function renderTable(){

const tbody=document.querySelector("#expenseTable tbody");

tbody.innerHTML="";

let filtered=expenses.filter(exp=>{

return exp.vehicle

.toLowerCase()

.includes(search.value.toLowerCase());

});

if(filtered.length==0){

tbody.innerHTML=`

<tr>

<td colspan="8" class="empty">

No Expense Records

</td>

</tr>

`;

return;

}

filtered.forEach((exp,index)=>{

tbody.innerHTML+=`

<tr>

<td>${exp.vehicle}</td>

<td>${exp.date}</td>

<td>${exp.fuelLiter} L</td>

<td>₹ ${exp.fuelCost}</td>

<td>₹ ${exp.toll}</td>

<td>₹ ${exp.other}</td>

<td class="total">

₹ ${exp.total}

</td>

<td>

<button
class="edit-btn"
onclick="editExpense(${index})">

Edit

</button>

<button
class="delete-btn"
onclick="deleteExpense(${index})">

Delete

</button>

</td>

</tr>

`;

});

}

// =========================
// Edit
// =========================

function editExpense(index){

editIndex=index;

const exp=expenses[index];

form.style.display="block";

document.getElementById("vehicle").value=exp.vehicle;

document.getElementById("date").value=exp.date;

document.getElementById("fuelLiter").value=exp.fuelLiter;

document.getElementById("fuelCost").value=exp.fuelCost;

document.getElementById("toll").value=exp.toll;

document.getElementById("other").value=exp.other;

}

// =========================
// Delete
// =========================

function deleteExpense(index){

if(confirm("Delete Expense?")){

expenses.splice(index,1);

localStorage.setItem(

"expenses",

JSON.stringify(expenses)

);

renderTable();

}

}

// =========================
// Clear Form
// =========================

function clearForm(){

document.getElementById("vehicle").selectedIndex=0;

document.getElementById("date").value="";

document.getElementById("fuelLiter").value="";

document.getElementById("fuelCost").value="";

document.getElementById("toll").value="";

document.getElementById("other").value="";

}

// =========================
// Search
// =========================

search.addEventListener(

"keyup",

renderTable

);

// =========================
// Init
// =========================

loadVehicles();

renderTable();