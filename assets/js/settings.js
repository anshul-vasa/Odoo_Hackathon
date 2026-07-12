// ==========================================
// TransitOps Settings
// ==========================================

// Elements

const depot = document.getElementById("depot");
const currency = document.getElementById("currency");
const distance = document.getElementById("distance");
const theme = document.getElementById("theme");

const saveBtn = document.getElementById("saveSettings");

// ==========================================
// Load Saved Settings
// ==========================================

function loadSettings(){

    const settings = JSON.parse(localStorage.getItem("settings"));

    if(!settings) return;

    depot.value = settings.depot;
    currency.value = settings.currency;
    distance.value = settings.distance;
    theme.value = settings.theme;

    applyTheme(settings.theme);

}

// ==========================================
// Save Settings
// ==========================================

saveBtn.onclick = function(){

    const settings = {

        depot : depot.value.trim(),

        currency : currency.value,

        distance : distance.value,

        theme : theme.value

    };

    localStorage.setItem(

        "settings",

        JSON.stringify(settings)

    );

    applyTheme(settings.theme);

    alert("Settings Saved Successfully.");

};

// ==========================================
// Theme Change
// ==========================================

theme.addEventListener("change",function(){

    applyTheme(this.value);

});

// ==========================================
// Apply Theme
// ==========================================

function applyTheme(mode){

    if(mode=="Light"){

        document.body.style.background="#f5f5f5";

        document.body.style.color="#111";

    }

    else{

        document.body.style.background="#111827";

        document.body.style.color="#fff";

    }

}

// ==========================================
// Initial Load
// ==========================================

loadSettings();