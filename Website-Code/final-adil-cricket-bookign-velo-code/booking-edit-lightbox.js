// fronend lightbox/popup code

import wixWindow from 'wix-window';
import wixData from 'wix-data';
import * as run from 'backend/flow.jsw';

$w.onReady(async function () {
    const receivedID = wixWindow.lightbox.getContext();
    // console.log("Received booking ID:", receivedID);

    if (!receivedID) return;

    let existingBooking;

    try {
        // ✅ Fetch the booking record
        existingBooking = await wixData.get("BookingsCollection", receivedID);

        // ✅ Load dropdown data BEFORE setting values
        await loadDropdownData();

        // ✅ Populate fields
        if (existingBooking) {
            $w("#userNameInput").value = existingBooking.userName || "";
            $w("#userEmailInput").value = existingBooking.userEmail || "";
            $w("#userPhoneInput").value = existingBooking.userPhone || "";
            $w("#bookingNameDropdown").value = existingBooking.bookingType || "";
            $w("#netNameDropdown").value = existingBooking.selectedNet || "";
            $w("#machineNameDropdown").value = existingBooking.selectedMachine || "";
            $w("#coachNameDropdown").value = existingBooking.selectedCoach || "";
            $w("#paymentStatusDropdown").value = existingBooking.paymentStatus || "";
            $w("#amountInput").value = existingBooking.amount || "";
            $w("#timeSlotDropdown").value = existingBooking.timeSlot || "";
            $w("#datePicker").value = existingBooking.date || null;
        }
    } catch (error) {
        console.error("Error fetching booking:", error);
    }

    // -------------------- Show Warning Function --------------------
    function showWarning(message) {
        $w("#warningMessage").text = message;
        $w("#warningMessage").show();

        // Hide after 3 seconds
        setTimeout(() => {
            $w("#warningMessage").hide();
        }, 3000);
    }

    // -------------------- Save Button Click --------------------
    $w("#saveUpdateButton").onClick(async () => {
        try {
            const selectedDate = $w("#datePicker").value;
            const selectedTime = $w("#timeSlotDropdown").value;
            const selectedNet = $w("#netNameDropdown").value;
            const selectedMachine = $w("#machineNameDropdown").value;
            const selectedCoach = $w("#coachNameDropdown").value;
            const paymentStatus = $w("#paymentStatusDropdown").value;
            const amount = $w("#amountInput").value;

            // -------------------- Required Field Validation --------------------
            if (!selectedDate) {
                showWarning("⚠️ Please select a date.");
                return;
            }
            if (!selectedTime) {
                showWarning("⚠️ Please select a time slot.");
                return;
            }
            if (!selectedNet) {
                showWarning("⚠️ Please select a Net.");
                return;
            }
            if (!amount) {
                showWarning("⚠️ Please enter the amount.");
                return;
            }

            // -------------------- Availability Checks --------------------
            // Net availability
            const netConflict = await wixData.query("BookingsCollection")
                .eq("date", selectedDate)
                .eq("timeSlot", selectedTime)
                .eq("selectedNet", selectedNet)
                .ne("_id", existingBooking._id)
                .limit(1)
                .find();
            if (netConflict.items.length > 0) {
                showWarning("⚠️ Selected Net is not available for this date and time.");
                return;
            }

            // Machine availability
            const machineConflict = await wixData.query("BookingsCollection")
                .eq("date", selectedDate)
                .eq("timeSlot", selectedTime)
                .eq("selectedMachine", selectedMachine)
                .ne("_id", existingBooking._id)
                .limit(1)
                .find();
            if (machineConflict.items.length > 0) {
                showWarning("⚠️ Selected Machine is not available for this date and time.");
                return;
            }

            // Coach availability
            const coachConflict = await wixData.query("BookingsCollection")
                .eq("date", selectedDate)
                .eq("timeSlot", selectedTime)
                .eq("selectedCoach", selectedCoach)
                .ne("_id", existingBooking._id)
                .limit(1)
                .find();
            if (coachConflict.items.length > 0) {
                showWarning("⚠️ Selected Coach is not available for this date and time.");
                return;
            }

            // -------------------- Update Booking --------------------
            const updatedBooking = {
                _id: existingBooking._id, // must be valid
                userName: $w("#userNameInput").value,
                userEmail: $w("#userEmailInput").value,
                userPhone: $w("#userPhoneInput").value,
                bookingType: $w("#bookingNameDropdown").value,
                selectedNet: selectedNet || null,
                selectedMachine: selectedMachine || null,
                selectedCoach: selectedCoach || null,
                paymentStatus,
                amount,
                timeSlot: selectedTime,
                date: selectedDate
            };

            // Fetch Net, Machine, Coach names
            let netItem = { netName: "" };
            let machineItem = { machineName: "" };
            let coachItem = { coachName: "" };

            if (updatedBooking.selectedNet) {
                netItem = await wixData.get("NetsCollection", updatedBooking.selectedNet);
            }
            if (updatedBooking.selectedMachine) {
                machineItem = await wixData.get("BowlingMachinesCollection", updatedBooking.selectedMachine);
            }
            if (updatedBooking.selectedCoach) {
                coachItem = await wixData.get("CoachesCollection", updatedBooking.selectedCoach);
            }

            const emailData = {
                bookingType: updatedBooking.bookingType,
                timeSlot: updatedBooking.timeSlot,
                date: updatedBooking.date,
                selectedNet: netItem.netName,
                selectedMachine: machineItem.machineName,
                selectedCoach: coachItem.coachName,

                amount: updatedBooking.amount,
                paymentStatus: updatedBooking.paymentStatus,

                userName: updatedBooking.userName,
                userEmail: updatedBooking.userEmail,
                userPhone: updatedBooking.userPhone,
            };

            // console.log("updatedBooking: ", updatedBooking)
            await wixData.update("BookingsCollection", updatedBooking);

            const resultEmail = await run.triggerOrderEmails(emailData);
            console.log("resultEmail: ", resultEmail)
            wixWindow.lightbox.close(updatedBooking);

        } catch (error) {
            console.error("Error updating booking:", error);
            showWarning("❌ An error occurred while updating the booking.");
        }
    });

});

// -------------------- Load Dropdown Data --------------------
async function loadDropdownData() {
    try {
        // Booking type dropdown (manual options)
        $w("#bookingNameDropdown").options = [
            { label: "Net Hire", value: "Net" },
            { label: "1-2-1 Coaching", value: "1-2-1 Coaching" }
        ];

        $w("#paymentStatusDropdown").options = [
            { label: "Pending", value: "Pending" },
            { label: "Offline", value: "Offline" },
            { label: "Paid", value: "Paid" }
        ];

        // Nets dropdown
        const nets = await wixData.query("NetsCollection").ascending("netID").find();
        $w("#netNameDropdown").options = nets.items.map(n => ({
            label: n.title || n.netName || `Net ${n.netID}`,
            value: n._id
        }));

        // Machines dropdown
        const machines = await wixData.query("BowlingMachinesCollection").ascending("machineID").find();
        $w("#machineNameDropdown").options = machines.items.map(m => ({
            label: m.title || m.machineName || `Machine ${m.machineID}`,
            value: m._id
        }));

        // Coaches dropdown
        const coaches = await wixData.query("CoachesCollection").ascending("coachID").find();
        $w("#coachNameDropdown").options = coaches.items.map(c => ({
            label: c.title || c.coachName || `Coach ${c.coachID}`,
            value: c._id
        }));

        // Time slot dropdown (fixed list)
        const timeSlots = [
            "09:30–10:30", "10:30–11:30", "11:30–12:30", "12:30–13:30",
            "13:30–14:30", "14:30–15:30", "15:30–16:30", "16:30–17:30",
            "17:30–18:30", "18:30–19:30", "19:30–20:30", "20:30–21:30"
        ];
        $w("#timeSlotDropdown").options = timeSlots.map(t => ({ label: t, value: t }));

    } catch (error) {
        console.error("Error loading dropdown data:", error);
    }
}