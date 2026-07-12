// =============================================
// TransitOps - Driver Wages Management
// =============================================

let salaries = JSON.parse(localStorage.getItem("salaries")) || [];
let drivers = JSON.parse(localStorage.getItem("drivers")) || [];

let editIndex = -1;

// Elements
const form = document.getElementById("salaryForm");
const driverSelect = document.getElementById("driver");
const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");

// ================================
// Show Form
// ================================

document.getElementById("addBtn").onclick = () => {

    form.style.display = "block";

    clearForm();

    editIndex = -1;

};

// ================================
// Cancel
// ================================

document.getElementById("cancel").onclick = () => {

    form.style.display = "none";

};

// ================================
// Load Drivers
// ================================

function loadDrivers() {

    driverSelect.innerHTML = "<option value=''>Select Driver</option>";

    drivers.forEach(driver => {

        driverSelect.innerHTML += `
        <option value="${driver.driverName}">
            ${driver.driverName}
        </option>
        `;

    });

}

// ================================
// Auto Salary Calculation
// ================================

const salaryInputs = [

"basic",
"tripAllowance",
"fuelAllowance",
"foodAllowance",
"bonus",
"deduction"

];

salaryInputs.forEach(id => {

    document.getElementById(id).addEventListener(

        "input",

        calculateSalary

    );

});

function calculateSalary() {

    const basic = Number(document.getElementById("basic").value) || 0;

    const trip = Number(document.getElementById("tripAllowance").value) || 0;

    const fuel = Number(document.getElementById("fuelAllowance").value) || 0;

    const food = Number(document.getElementById("foodAllowance").value) || 0;

    const bonus = Number(document.getElementById("bonus").value) || 0;

    const deduction = Number(document.getElementById("deduction").value) || 0;

    const net = basic + trip + fuel + food + bonus - deduction;

    document.getElementById("netSalary").value = net;

}

// ================================
// Save Salary
// ================================

document.getElementById("saveSalary").onclick = function () {

    const data = {

        driver: driverSelect.value,

        date: document.getElementById("salaryDate").value,

        basic: document.getElementById("basic").value,

        trip: document.getElementById("tripAllowance").value,

        fuel: document.getElementById("fuelAllowance").value,

        food: document.getElementById("foodAllowance").value,

        bonus: document.getElementById("bonus").value,

        deduction: document.getElementById("deduction").value,

        net: document.getElementById("netSalary").value,

        status: document.getElementById("paymentStatus").value

    };

    if (
        data.driver == "" ||
        data.date == "" ||
        data.basic == ""
    ) {

        alert("Please fill all required fields.");

        return;

    }

    if (editIndex == -1) {

        salaries.push(data);

    } else {

        salaries[editIndex] = data;

    }

    localStorage.setItem(

        "salaries",

        JSON.stringify(salaries)

    );

    form.style.display = "none";

    clearForm();

    renderTable();

    updateCards();

    alert("Salary Saved Successfully.");

};

// ================================
// Render Table
// ================================

function renderTable() {

    const tbody = document.querySelector("#salaryTable tbody");

    tbody.innerHTML = "";

    let filtered = salaries.filter(item => {

        const searchMatch =
            item.driver.toLowerCase().includes(search.value.toLowerCase());

        const statusMatch =
            statusFilter.value == "" ||
            item.status == statusFilter.value;

        return searchMatch && statusMatch;

    });

    if (filtered.length == 0) {

        tbody.innerHTML = `

<tr>

<td colspan="8" class="empty">

No Salary Records

</td>

</tr>

`;

        return;

    }

    filtered.forEach((item, index) => {

        const badge =
            item.status == "Paid"
                ? "paid"
                : "pending";

        tbody.innerHTML += `

<tr>

<td>${item.driver}</td>

<td>${item.date}</td>

<td>₹ ${item.basic}</td>

<td>₹ ${item.bonus}</td>

<td>₹ ${item.deduction}</td>

<td class="salary">

₹ ${item.net}

</td>

<td>

<span class="status ${badge}">

${item.status}

</span>

</td>

<td>

<button class="edit-btn"
onclick="editSalary(${index})">

Edit

</button>

<button class="delete-btn"
onclick="deleteSalary(${index})">

Delete

</button>

</td>

</tr>

`;

    });

}

// ================================
// Edit
// ================================

function editSalary(index) {

    editIndex = index;

    const item = salaries[index];

    form.style.display = "block";

    driverSelect.value = item.driver;

    document.getElementById("salaryDate").value = item.date;

    document.getElementById("basic").value = item.basic;

    document.getElementById("tripAllowance").value = item.trip;

    document.getElementById("fuelAllowance").value = item.fuel;

    document.getElementById("foodAllowance").value = item.food;

    document.getElementById("bonus").value = item.bonus;

    document.getElementById("deduction").value = item.deduction;

    document.getElementById("paymentStatus").value = item.status;

    calculateSalary();

}

// ================================
// Delete
// ================================

function deleteSalary(index) {

    if (confirm("Delete Salary Record?")) {

        salaries.splice(index, 1);

        localStorage.setItem(

            "salaries",

            JSON.stringify(salaries)

        );

        renderTable();

        updateCards();

    }

}

// ================================
// KPI Cards
// ================================

function updateCards() {

    let payroll = 0;

    let paid = 0;

    let pending = 0;

    salaries.forEach(item => {

        payroll += Number(item.net);

        if (item.status == "Paid")
            paid++;

        else
            pending++;

    });

    document.getElementById("totalPayroll").innerHTML =
        "₹ " + payroll.toLocaleString();

    document.getElementById("paidCount").innerHTML =
        paid;

    document.getElementById("pendingCount").innerHTML =
        pending;

    document.getElementById("driverCount").innerHTML =
        drivers.length;

}

// ================================
// Clear Form
// ================================

function clearForm() {

    driverSelect.selectedIndex = 0;

    document.getElementById("salaryDate").value = "";

    document.getElementById("basic").value = "";

    document.getElementById("tripAllowance").value = "";

    document.getElementById("fuelAllowance").value = "";

    document.getElementById("foodAllowance").value = "";

    document.getElementById("bonus").value = "";

    document.getElementById("deduction").value = "";

    document.getElementById("netSalary").value = "";

    document.getElementById("paymentStatus").selectedIndex = 0;

}

// ================================
// Search
// ================================

search.addEventListener("keyup", renderTable);

statusFilter.addEventListener("change", renderTable);

// ================================
// Initialize
// ================================

loadDrivers();

renderTable();

updateCards();