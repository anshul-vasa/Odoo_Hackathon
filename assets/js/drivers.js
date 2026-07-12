// =======================================
// TransitOps Driver Management
// =======================================

const form = document.getElementById("driverForm");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancel");
const saveBtn = document.getElementById("saveDriver");

const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");

let drivers = JSON.parse(localStorage.getItem("drivers")) || [];
let editIndex = -1;

// Show Form
addBtn.onclick = () => {
    form.style.display = "block";
    clearForm();
    editIndex = -1;
};

// Hide Form
cancelBtn.onclick = () => {
    form.style.display = "none";
};

// Save Driver
saveBtn.onclick = function () {

    const driverName = document.getElementById("driverName").value.trim();
    const licenseNumber = document.getElementById("licenseNumber").value.trim();
    const licenseCategory = document.getElementById("licenseCategory").value.trim();
    const licenseExpiry = document.getElementById("licenseExpiry").value;
    const contactNumber = document.getElementById("contactNumber").value.trim();
    const safetyScore = document.getElementById("safetyScore").value;
    const status = document.getElementById("status").value;

    if (
        driverName === "" ||
        licenseNumber === "" ||
        licenseCategory === "" ||
        licenseExpiry === "" ||
        contactNumber === "" ||
        safetyScore === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    // License Number Unique
    const duplicate = drivers.find((d, i) =>
        d.licenseNumber.toLowerCase() === licenseNumber.toLowerCase() &&
        i !== editIndex
    );

    if (duplicate) {
        alert("License Number already exists.");
        return;
    }

    // Contact Validation
    if (contactNumber.length != 10) {
        alert("Enter valid 10 digit mobile number.");
        return;
    }

    // Expiry Validation
    const today = new Date();
    const expiry = new Date(licenseExpiry);

    if (expiry < today) {
        alert("Driver license has expired.");
        return;
    }

    const driver = {
        driverName,
        licenseNumber,
        licenseCategory,
        licenseExpiry,
        contactNumber,
        safetyScore,
        status
    };

    if (editIndex === -1) {
        drivers.push(driver);
    } else {
        drivers[editIndex] = driver;
    }

    localStorage.setItem("drivers", JSON.stringify(drivers));

    renderTable();

    clearForm();

    form.style.display = "none";
};

// =========================
// Render Table
// =========================

function renderTable() {

    const tbody = document.querySelector("#driverTable tbody");

    tbody.innerHTML = "";

    let filtered = drivers.filter(driver => {

        const searchMatch =
            driver.driverName.toLowerCase().includes(search.value.toLowerCase()) ||
            driver.licenseNumber.toLowerCase().includes(search.value.toLowerCase());

        const statusMatch =
            statusFilter.value === "" ||
            driver.status === statusFilter.value;

        return searchMatch && statusMatch;

    });

    if (filtered.length === 0) {

        tbody.innerHTML = `
        <tr>
            <td colspan="8" class="empty">
                No Drivers Found
            </td>
        </tr>`;

        return;
    }

    filtered.forEach((driver, index) => {

        let statusClass = "";

        switch (driver.status) {

            case "Available":
                statusClass = "available";
                break;

            case "On Trip":
                statusClass = "trip";
                break;

            case "Off Duty":
                statusClass = "off";
                break;

            case "Suspended":
                statusClass = "suspended";
                break;

        }

        let scoreClass = "high";

        if (driver.safetyScore < 80)
            scoreClass = "medium";

        if (driver.safetyScore < 50)
            scoreClass = "low";

        tbody.innerHTML += `

<tr>

<td>${driver.driverName}</td>

<td>${driver.licenseNumber}</td>

<td>${driver.licenseCategory}</td>

<td>${driver.licenseExpiry}</td>

<td>${driver.contactNumber}</td>

<td>
<span class="score ${scoreClass}">
${driver.safetyScore}
</span>
</td>

<td>
<span class="status ${statusClass}">
${driver.status}
</span>
</td>

<td>

<button class="edit-btn"
onclick="editDriver(${index})">

Edit

</button>

<button class="delete-btn"
onclick="deleteDriver(${index})">

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

function editDriver(index) {

    const driver = drivers[index];

    editIndex = index;

    form.style.display = "block";

    document.getElementById("driverName").value = driver.driverName;
    document.getElementById("licenseNumber").value = driver.licenseNumber;
    document.getElementById("licenseCategory").value = driver.licenseCategory;
    document.getElementById("licenseExpiry").value = driver.licenseExpiry;
    document.getElementById("contactNumber").value = driver.contactNumber;
    document.getElementById("safetyScore").value = driver.safetyScore;
    document.getElementById("status").value = driver.status;

}

// =========================
// Delete
// =========================

function deleteDriver(index) {

    if (confirm("Delete this driver?")) {

        drivers.splice(index, 1);

        localStorage.setItem("drivers", JSON.stringify(drivers));

        renderTable();

    }

}

// =========================
// Clear Form
// =========================

function clearForm() {

    document.getElementById("driverName").value = "";
    document.getElementById("licenseNumber").value = "";
    document.getElementById("licenseCategory").value = "";
    document.getElementById("licenseExpiry").value = "";
    document.getElementById("contactNumber").value = "";
    document.getElementById("safetyScore").value = "";

    document.getElementById("status").selectedIndex = 0;

}

// Search & Filter

search.addEventListener("keyup", renderTable);

statusFilter.addEventListener("change", renderTable);

// Initial Load

renderTable();