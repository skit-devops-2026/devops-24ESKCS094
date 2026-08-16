/* =========================================================
   PETPAL - MEDICINE TRACKER
   ========================================================= */


/* =========================================================
   1. GET HTML ELEMENTS
   ========================================================= */

const medicineForm = document.getElementById("medicineForm");

const medicineName = document.getElementById("medicineName");
const dosage = document.getElementById("dosage");
const frequency = document.getElementById("frequency");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");

const medicineList = document.getElementById("medicineList");
const medicineCount = document.getElementById("medicineCount");


/* =========================================================
   2. LOCAL STORAGE KEY
   ========================================================= */

const STORAGE_KEY = "petpalMedicines";


/* =========================================================
   3. LOAD MEDICINES FROM LOCAL STORAGE
   ========================================================= */

let medicines = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];


/* =========================================================
   4. SAVE MEDICINES TO LOCAL STORAGE
   ========================================================= */

function saveMedicines() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
}


/* =========================================================
   5. DISPLAY MEDICINE COUNT
   ========================================================= */

function updateMedicineCount() {

    const count = medicines.length;

    medicineCount.textContent =
        count === 1
            ? "1 medicine"
            : `${count} medicines`;
}


/* =========================================================
   6. DISPLAY MEDICINES
   ========================================================= */

function displayMedicines() {

    medicineList.innerHTML = "";

    updateMedicineCount();


    /* If there are no medicines */

    if (medicines.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-message";

        emptyMessage.textContent =
            "No medicines added yet.";

        medicineList.appendChild(emptyMessage);

        return;
    }


    /* Create a card for every medicine */

    medicines.forEach(function (medicine) {

        const medicineItem = document.createElement("div");

        medicineItem.className = "medicine-item";


        medicineItem.innerHTML = `

            <div class="medicine-name">
                <strong>${medicine.name}</strong>
            </div>

            <div class="medicine-dosage">
                ${medicine.dosage}
            </div>

            <div class="medicine-frequency">
                ${medicine.frequency}
            </div>

            <div class="medicine-duration">
                ${formatDate(medicine.startDate)}
                <br>
                –
                <br>
                ${formatDate(medicine.endDate)}
            </div>

            <div class="medicine-actions">

                <button
                    class="delete-btn"
                    onclick="deleteMedicine(${medicine.id})"
                    title="Delete medicine"
                >
                    🗑️
                </button>

            </div>

        `;


        medicineList.appendChild(medicineItem);

    });
}


/* =========================================================
   7. FORMAT DATE
   ========================================================= */

function formatDate(date) {

    if (!date) {
        return "";
    }

    const dateObject = new Date(date);

    const day = String(dateObject.getDate()).padStart(2, "0");

    const month = String(dateObject.getMonth() + 1).padStart(2, "0");

    const year = dateObject.getFullYear();

    return `${day}-${month}-${year}`;
}


/* =========================================================
   8. ADD MEDICINE
   ========================================================= */

medicineForm.addEventListener("submit", function (event) {

    event.preventDefault();


    /* Get values */

    const name = medicineName.value.trim();

    const medicineDosage = dosage.value.trim();

    const medicineFrequency = frequency.value;

    const medicineStartDate = startDate.value;

    const medicineEndDate = endDate.value;


    /* Check that end date is not before start date */

    if (medicineEndDate < medicineStartDate) {

        alert("End date cannot be before the start date.");

        return;
    }


    /* Create medicine object */

    const newMedicine = {

        id: Date.now(),

        name: name,

        dosage: medicineDosage,

        frequency: medicineFrequency,

        startDate: medicineStartDate,

        endDate: medicineEndDate

    };


    /* Add medicine to array */

    medicines.push(newMedicine);


    /* Save to LocalStorage */

    saveMedicines();


    /* Refresh medicine list */

    displayMedicines();


    /* Clear form */

    medicineForm.reset();

});


/* =========================================================
   9. DELETE MEDICINE
   ========================================================= */

function deleteMedicine(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this medicine?"
    );


    if (!confirmDelete) {
        return;
    }


    medicines = medicines.filter(function (medicine) {

        return medicine.id !== id;

    });


    saveMedicines();

    displayMedicines();
}


/* =========================================================
   10. INITIAL DISPLAY
   ========================================================= */

displayMedicines();