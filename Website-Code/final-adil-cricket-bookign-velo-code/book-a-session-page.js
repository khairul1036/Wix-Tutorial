import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { createClassPayment } from 'backend/pay.jsw';
import wixPay from 'wix-pay';
import * as run from 'backend/flow.jsw';

let selectedButtonId = "netHireButton";
let selectedTimeData = null;
let selectedDate;
let lastSelectedTime = null;

const timeDataTemplate = [
    { "_id": "1", "time": "09:30–10:30", "available": true },
    { "_id": "2", "time": "10:30–11:30", "available": true },
    { "_id": "3", "time": "11:30–12:30", "available": true },
    { "_id": "4", "time": "12:30–13:30", "available": true },
    { "_id": "5", "time": "13:30–14:30", "available": true },
    { "_id": "6", "time": "14:30–15:30", "available": true },
    { "_id": "7", "time": "15:30–16:30", "available": true },
    { "_id": "8", "time": "16:30–17:30", "available": true },
    { "_id": "9", "time": "17:30–18:30", "available": true },
    { "_id": "10", "time": "18:30–19:30", "available": true },
    { "_id": "11", "time": "19:30–20:30", "available": true },
    { "_id": "12", "time": "20:30–21:30", "available": true },
];

$w.onReady(async function () {
    // -------------------- Button Toggle --------------------
    setSelectedButton("netHireButton");
    $w("#netHireButton").onClick(() => setSelectedButton("netHireButton"));
    $w("#oneToOneCoachingButton").onClick(() => setSelectedButton("oneToOneCoachingButton"));

    // -------------------- Date Picker Default --------------------
    const today = new Date();
    selectedDate = today;
    await loadAvailability(selectedDate);
    showAllAvailableText();

    // -------------------- Date Change --------------------
    $w("#selectDatePicker").onChange(async () => {
        selectedDate = $w("#selectDatePicker").value;
        lastSelectedTime = null;
        selectedTimeData = null;
        if (!selectedDate) return;
        await loadAvailability(selectedDate);
        showAllAvailableText();
    });

    // -------------------- Time Slot Selection --------------------
    $w("#selectTimeRepeater").onItemReady(($item, itemData) => {
        $item("#selectTimeText").text = itemData.time;
        updateTimeBoxColor($item, itemData);

        $item("#selectTimeBox").onClick(() => { }); // reset
        if (itemData.available) {
            $item("#selectTimeBox").onClick(async () => {
                if (lastSelectedTime === itemData.time) return;
                lastSelectedTime = itemData.time;
                selectedTimeData = itemData;

                $w("#selectTimeRepeater").forEachItem(($ri, riData) => {
                    updateTimeBoxColor($ri, riData);
                });

                updateTotal();

                if (selectedDate && selectedTimeData) {
                    await updateAvailabilityCounts(selectedDate, selectedTimeData.time);
                }
            });
        }
    });

    // -------------------- Add Machine Checkbox --------------------
    $w("#addMachineCheckbox").onChange(() => updateTotal());

    // -------------------- Net Hire Booking (with payment) --------------------
    $w("#bookNowButton").onClick(async () => {
        selectedDate = $w("#selectDatePicker").value;
        const addMachine = $w("#addMachineCheckbox").checked;
        const bookingType = selectedButtonId === "netHireButton" ? "Net" : "1-2-1 Coaching";

        if (!selectedDate || !selectedTimeData) {
            showWarning("Please select a date and time!");
            return;
        }

        try {
            const totalAmount = parseFloat($w("#totalAmountText").text.replace("Price: £", ""));
            await createBooking(
                bookingType,
                selectedDate,
                selectedTimeData.time,
                addMachine,
                totalAmount
            );

            selectedTimeData = null;
            lastSelectedTime = null;
            await loadAvailability(selectedDate);
            showAllAvailableText();
        } catch (err) {
            showWarning(err.message);
        }
    });

    // -------------------- Coaching Booking (no payment) --------------------
    $w("#oneToOneCoachingBookingButton").onClick(async () => {
        const userName = $w("#userNameInput").value;
        const userEmail = $w("#userEmailInput").value;
        const userPhone = $w("#userPhoneInput").value;

        if (!userName || !userEmail || !userPhone) {
            showWarning("Please fill in all your details!");
            return;
        }

        const bookingData = {
            bookingType: "1-2-1 Coaching",
            userName,
            userEmail,
            userPhone,
            paymentStatus: "Pending"
        };

        try {
            await wixData.insert("BookingsCollection", bookingData);
            showWarning("✅ Coaching booking saved successfully!");
            // console.log("Coaching booking saved:", bookingData);
            // ------------------- CLEAR INPUT FIELDS -------------------
            $w("#userNameInput").value = "";
            $w("#userEmailInput").value = "";
            $w("#userPhoneInput").value = "";
        } catch (err) {
            console.error("Error saving coaching booking:", err);
            showWarning("❌ Failed to save coaching booking.");
        }
    });
});

// -------------------- BUTTON SELECTION --------------------
function setSelectedButton(selectedId) {
    selectedButtonId = selectedId;
    const buttons = ["netHireButton", "oneToOneCoachingButton"];
    buttons.forEach(buttonId => {
        if (buttonId === selectedId) {
            $w(`#${buttonId}`).style.backgroundColor = "#007BFF";
            $w(`#${buttonId}`).style.color = "#FFFFFF";
        } else {
            $w(`#${buttonId}`).style.backgroundColor = "#F9F9F9";
            $w(`#${buttonId}`).style.color = "#000000";
        }
    });
    showRelevantBox();
}

// -------------------- MULTISTATE --------------------
function showRelevantBox() {
    if (selectedButtonId === "netHireButton") {
        $w("#multiStateBox").changeState("netHireBox");
    } else if (selectedButtonId === "oneToOneCoachingButton") {
        $w("#multiStateBox").changeState("coachingBox");
    }
}

// -------------------- INTERVAL REFRESH --------------------
setInterval(async () => {
    selectedDate = $w("#selectDatePicker").value;
    if (selectedDate) await loadAvailability(selectedDate);
}, 1000);

// -------------------- WARNING --------------------
function showWarning(message) {
    $w("#warningText").text = message;
    $w("#warningText").style.color = "red";
    $w("#warningText").show();
    setTimeout(() => $w("#warningText").hide(), 2000);

    $w("#warningText2").text = message;
    $w("#warningText2").style.color = "red";
    $w("#warningText2").show();
    setTimeout(() => $w("#warningText2").hide(), 2000);
}

// -------------------- TOTAL --------------------
function updateTotal() {
    if (!selectedTimeData) {
        $w("#totalAmountText").text = "Price: £0";
        return;
    }
    const time = selectedTimeData.time.split("–")[0];
    let baseAmount = (time >= "09:30" && time < "16:30") ? 20 : 30;
    const addMachine = $w("#addMachineCheckbox").checked;
    const total = baseAmount + (addMachine ? 5 : 0);
    $w("#totalAmountText").text = `Price: £${total}`;
}

// -------------------- TIME COLOR --------------------
function updateTimeBoxColor($item, itemData) {
    if (!itemData.available) {
        $item("#selectTimeBox").style.backgroundColor = "#E0E0E0";
        $item("#selectTimeText").style.color = "#7D7D7D";
    } else if (selectedTimeData && selectedTimeData._id === itemData._id) {
        $item("#selectTimeBox").style.backgroundColor = "#007BFF";
        $item("#selectTimeText").style.color = "#FFFFFF";
    } else {
        $item("#selectTimeBox").style.backgroundColor = "#FFFFFF";
        $item("#selectTimeText").style.color = "#000000";
    }
}

// -------------------- TEXT --------------------
function showAllAvailableText() {
    $w("#netAvailableText").text = "Nets available: 4";
    $w("#machinesAvailableText").text = "Machines available: 2";
    $w("#coachesAvailableText").text = "Coaches available: 4";
}

// -------------------- LOAD AVAILABILITY --------------------
async function loadAvailability(selectedDate) {
    const bookings = await wixData.query("BookingsCollection")
        .eq("date", selectedDate)
        .find();

    const bookedNets = {};
    bookings.items.forEach(b => {
        if (b.selectedNet) bookedNets[b.timeSlot] = (bookedNets[b.timeSlot] || 0) + 1;
    });

    const updatedTimeData = timeDataTemplate.map(slot => {
        const booked = bookedNets[slot.time] || 0;
        return { ...slot, available: booked < 4 };
    });

    if (selectedTimeData) {
        const stillAvailable = updatedTimeData.find(t => t._id === selectedTimeData._id)?.available;
        if (!stillAvailable) selectedTimeData = null;
    }

    $w("#selectTimeRepeater").data = [];
    $w("#selectTimeRepeater").data = updatedTimeData;
}

// -------------------- UPDATE COUNTS --------------------
async function updateAvailabilityCounts(selectedDate, selectedTime) {
    const bookings = await wixData.query("BookingsCollection")
        .eq("date", selectedDate)
        .eq("timeSlot", selectedTime)
        .find();

    const totalNets = 4,
        totalMachines = 2,
        totalCoaches = 4;

    const bookedNetsCount = bookings.items.filter(b => b.selectedNet).length;
    const bookedMachinesCount = bookings.items.filter(b => b.selectedMachine).length;
    const bookedCoachesCount = bookings.items.filter(b => b.selectedCoach).length;

    $w("#netAvailableText").text = `Nets available: ${Math.max(0, totalNets - bookedNetsCount)}`;
    $w("#machinesAvailableText").text = `Machines available: ${Math.max(0, totalMachines - bookedMachinesCount)}`;
    $w("#coachesAvailableText").text = `Coaches available: ${Math.max(0, totalCoaches - bookedCoachesCount)}`;
}

// -------------------- CREATE BOOKING (NetHire only) --------------------
async function createBooking(bookingType, date, timeSlot, addMachine, price) {
    let userName = "";
    let userEmail = "";
    let userPhone = "";

    if (selectedButtonId === "oneToOneCoachingButton") {
        userName = $w("#userNameInput").value;
        userEmail = $w("#userEmailInput").value;
        userPhone = $w("#userPhoneInput").value;

        if (!userName || !userEmail || !userPhone) {
            showWarning("Please fill in all your details!");
            throw new Error("Missing user details.");
        }
    }

    const bookingsRes = await wixData.query("BookingsCollection")
        .eq("date", date)
        .eq("timeSlot", timeSlot)
        .find();

    const slotBookings = bookingsRes.items;

    let selectedNet = null;
    if (bookingType === "Net" || bookingType === "1-2-1 Coaching") {
        const bookedNetIDs = slotBookings.map(b => b.selectedNet);
        const allNets = await wixData.query("NetsCollection").limit(4).ascending("netID").find();
        selectedNet = allNets.items.find(n => !bookedNetIDs.includes(n._id));
        if (!selectedNet) throw new Error("All nets are booked for this slot!");
    }

    let selectedMachine = null;
    if (addMachine) {
        const bookedMachineIDs = slotBookings.map(b => b.selectedMachine);
        const allMachines = await wixData.query("BowlingMachinesCollection").limit(2).ascending("machineID").find();
        selectedMachine = allMachines.items.find(m => !bookedMachineIDs.includes(m._id));
        if (!selectedMachine) throw new Error("All machines are booked for this slot!");
    }

    const newBooking = {
        bookingType,
        selectedNet: selectedNet ? selectedNet._id : null,
        selectedMachine: selectedMachine ? selectedMachine._id : null,
        date: selectedDate,
        timeSlot,
        amount: price
    };

    if (selectedTimeData) {
        await updateAvailabilityCounts(selectedDate, selectedTimeData.time);
    } else {
        showAllAvailableText();
    }

    try {
        const payment = await createClassPayment({
            amount: newBooking.amount,
            className: bookingType
        });

        const result = await wixPay.startPayment(payment.id, {
            termsAndConditionsLink: 'https://www.arcclanebooking.co.uk'
        });

        if (result.status === "Successful") {
            const saveData = {
                ...newBooking,
                userName: userName || (result.userInfo.firstName + " " + result.userInfo.lastName),
                userEmail: userEmail || result.userInfo.email,
                userPhone: userPhone || result.userInfo.phone,
                transactionId: result.transactionId,
                paymentStatus: "Paid"
            };

            await wixData.insert("BookingsCollection", saveData);

            // Fetch Net, Machine, Coach names
            let netItem = { netName: "" };
            let machineItem = { machineName: "" };

            if (newBooking.selectedNet) {
                netItem = await wixData.get("NetsCollection", newBooking.selectedNet);
            }
            if (newBooking.selectedMachine) {
                machineItem = await wixData.get("BowlingMachinesCollection", newBooking.selectedMachine);
            }

            const emailData = {
                bookingType: newBooking.bookingType,
                timeSlot: newBooking.timeSlot,
                date: newBooking.date,
                selectedNet: netItem.netName,
                selectedMachine: machineItem.machineName,
                selectedCoach: 'N/A',

                amount: newBooking.amount,
                paymentStatus: saveData.paymentStatus,

                userName: saveData.userName,
                userEmail: saveData.userEmail,
                userPhone: saveData.userPhone,
            };

            // console.log("success email : ", emailData)
            await run.triggerOrderEmails(emailData);

            showWarning("✅ Booking completed.");
        } else if (result.status === "Offline") {
            const saveData = {
                ...newBooking,
                userName: userName || (result.userInfo.firstName + " " + result.userInfo.lastName),
                userEmail: userEmail || result.userInfo.email,
                userPhone: userPhone || result.userInfo.phone,
                paymentStatus: "Offline"
            };

            await wixData.insert("BookingsCollection", saveData);

            // Fetch Net, Machine, Coach names
            let netItem = { netName: "" };
            let machineItem = { machineName: "" };

            if (newBooking.selectedNet) {
                netItem = await wixData.get("NetsCollection", newBooking.selectedNet);
            }
            if (newBooking.selectedMachine) {
                machineItem = await wixData.get("BowlingMachinesCollection", newBooking.selectedMachine);
            }

            const emailData = {
                bookingType: newBooking.bookingType,
                timeSlot: newBooking.timeSlot,
                date: newBooking.date,
                selectedNet: netItem.netName,
                selectedMachine: machineItem.machineName,
                selectedCoach: 'N/A',

                amount: newBooking.amount,
                paymentStatus: saveData.paymentStatus,

                userName: saveData.userName,
                userEmail: saveData.userEmail,
                userPhone: saveData.userPhone,
            };

            // console.log("success email offilene: ", emailData)
            await run.triggerOrderEmails(emailData);

            showWarning("✅ Booking completed. Pay now Offline.");
        } else if (result.status === "Cancelled") {
            showWarning("Payment cancelled.");
        } else {
            showWarning("Payment not completed.");
        }

    } catch (error) {
        console.error("Payment error:", error);
        showWarning("Payment failed. Please try again.");
    }
}