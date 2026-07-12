// ================================
// TransitOps Vehicle Registry
// ================================

// Elements
const form = document.getElementById("vehicleForm");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancel");
const saveBtn = document.getElementById("saveVehicle");

const search = document.getElementById("search");
const typeFilter = document.getElementById("typeFilter");
const statusFilter = document.getElementById("statusFilter");

let vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
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

// Save Vehicle
saveBtn.onclick = function () {

    const regNo = document.getElementById("regNo").value.trim();
    const model = document.getElementById("model").value.trim();
    const type = document.getElementById("type").value;
    const capacity = document.getElementById("capacity").value;
    const odometer = document.getElementById("odometer").value;
    const cost = document.getElementById("cost").value;
    const status = document.getElementById("status").value;

    // Validation

    if (
        regNo === "" ||
        model === "" ||
        capacity === "" ||
        odometer === "" ||
        cost === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    // Unique Registration Number

    const duplicate = vehicles.find((v, i) =>
        v.regNo.toLowerCase() === regNo.toLowerCase() &&
        i !== editIndex
    );

    if (duplicate) {
        alert("Registration Number already exists.");
        return;
    }

    const vehicle = {
        regNo,
        model,
        type,
        capacity,
        odometer,
        cost,
        status
    };

    if (editIndex === -1) {
        vehicles.push(vehicle);
    } else {
        vehicles[editIndex] = vehicle;
    }

    localStorage.setItem("vehicles", JSON.stringify(vehicles));

    renderTable();

    clearForm();

    form.style.display = "none";
};

// Render Table

function renderTable() {

    const tbody = document.querySelector("#vehicleTable tbody");

    tbody.innerHTML = "";

    let filtered = vehicles.filter(v => {

        const searchMatch =
            v.model.toLowerCase().includes(search.value.toLowerCase()) ||
            v.regNo.toLowerCase().includes(search.value.toLowerCase());

        const typeMatch =
            typeFilter.value === "" ||
            v.type === typeFilter.value;

        const statusMatch =
            statusFilter.value === "" ||
            v.status === statusFilter.value;

        return searchMatch && typeMatch && statusMatch;

    });

    if (filtered.length === 0) {

        tbody.innerHTML = `
        <tr>
            <td colspan="8" class="empty">
                No Vehicles Found
            </td>
        </tr>`;

        return;
    }

    filtered.forEach((v, index) => {

        let badge = "";

        switch (v.status) {

            case "Available":
                badge = "available";
                break;

            case "On Trip":
                badge = "trip";
                break;

            case "In Shop":
                badge = "shop";
                break;

            case "Retired":
                badge = "retired";
                break;

        }

        tbody.innerHTML += `

<tr>

<td>${v.regNo}</td>

<td>${v.model}</td>

<td>${v.type}</td>

<td>${v.capacity} KG</td>

<td>${v.odometer} KM</td>

<td>₹ ${Number(v.cost).toLocaleString()}</td>

<td>
<span class="status ${badge}">
${v.status}
</span>
</td>

<td>

<button class="edit-btn"
onclick="editVehicle(${index})">

Edit

</button>

<button class="delete-btn"
onclick="deleteVehicle(${index})">

Delete

</button>

</td>

</tr>

`;

    });

}

// Edit

function editVehicle(index) {

    const v = vehicles[index];

    editIndex = index;

    form.style.display = "block";

    document.getElementById("regNo").value = v.regNo;
    document.getElementById("model").value = v.model;
    document.getElementById("type").value = v.type;
    document.getElementById("capacity").value = v.capacity;
    document.getElementById("odometer").value = v.odometer;
    document.getElementById("cost").value = v.cost;
    document.getElementById("status").value = v.status;

}

// Delete

function deleteVehicle(index) {

    if (confirm("Delete this vehicle?")) {

        vehicles.splice(index, 1);

        localStorage.setItem(
            "vehicles",
            JSON.stringify(vehicles)
        );

        renderTable();

    }

}

// Clear Form

function clearForm() {

    document.getElementById("regNo").value = "";
    document.getElementById("model").value = "";
    document.getElementById("capacity").value = "";
    document.getElementById("odometer").value = "";
    document.getElementById("cost").value = "";

    document.getElementById("type").selectedIndex = 0;
    document.getElementById("status").selectedIndex = 0;

}

// Search & Filter

search.addEventListener("keyup", renderTable);

typeFilter.addEventListener("change", renderTable);

statusFilter.addEventListener("change", renderTable);

// Initial Load

renderTable();