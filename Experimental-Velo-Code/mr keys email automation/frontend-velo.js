import wixWindow from 'wix-window';
import wixData from 'wix-data';
import { local } from 'wix-storage-frontend';
import * as run from 'backend/flow.jsw';

let selectedSlotId = null;
let selectedSlotText = null;
let agentId = null;
let agentName = null;

let bookedSlotIds = [];

$w.onReady(async function () {

    $w('#messageText').hide();

    const data = wixWindow.lightbox.getContext();

    agentId = data.agentId;
    agentName = data.agentName;

    $w('#agentNameText').text = `Agent name: ${agentName}`;

    // =========================
    // REPEATER (ONLY ONCE)
    // =========================
    $w('#timeSlotRepeater').onItemReady(($item, itemData) => {

        const button = $item('#timeSlotButton');

        const isBooked = bookedSlotIds.includes(itemData._id);
        const isSelected = selectedSlotId === itemData._id;

        // RESET
        button.label = itemData.timeSlot;
        button.style.backgroundColor = '#FFFFFF';
        button.style.color = '#000000';

        // =========================
        // BOOKED SLOT
        // =========================
        if (isBooked) {

            button.label = `${itemData.timeSlot}`;
            button.disable();

            button.style.backgroundColor = '#E5E5E5';
            button.style.color = '#888888';
            button.style.borderColor = '#E5E5E5';

            button.onClick(() => { }); // safety
            return;
        }

        button.enable();

        // =========================
        // SELECTED SLOT
        // =========================
        if (isSelected) {
            button.style.backgroundColor = '#BF9B30';
            button.style.color = '#FFFFFF';
        }

        // =========================
        // CLICK HANDLER (FIXED)
        // =========================
        button.onClick(() => {

            if (selectedSlotId === itemData._id) {
                selectedSlotId = null;
                selectedSlotText = null;
            } else {
                selectedSlotId = itemData._id;
                selectedSlotText = itemData.timeSlot;
            }

            refreshUI(); // ONLY UI UPDATE
        });
    });

    await loadTimeSlots();

    $w('#bookingDatePicker').onChange(async () => {

        selectedSlotId = null;
        selectedSlotText = null;

        await loadTimeSlots();

        refreshUI(); // IMPORTANT
    });

    $w('#submitButton').onClick(handleSubmit);
});

/* =========================
LOAD TIME SLOTS
========================= */

async function loadTimeSlots() {

    try {

        const selectedDate = $w('#bookingDatePicker').value;

        const slotsResult = await wixData.query('ScheduleTimeSlots')
            .ascending('timeSlot')
            .find();

        bookedSlotIds = [];

        if (selectedDate) {

            const bookingsResult = await wixData.query('Bookings')
                .eq('selectedDate', selectedDate)
                .find();

            bookedSlotIds = bookingsResult.items.map(item =>
                item.timeSlotReferenceId?._id || item.timeSlotReferenceId
            );
        }

        $w('#timeSlotRepeater').data = slotsResult.items;

    } catch (err) {
        console.error(err);
        showMessage('Unable to load slots', true);
    }
}

/* =========================
REFRESH UI (ONLY ONE PLACE)
========================= */

function refreshUI() {

    $w('#timeSlotRepeater').forEachItem(($item, itemData) => {

        const button = $item('#timeSlotButton');

        const isBooked = bookedSlotIds.includes(itemData._id);
        const isSelected = selectedSlotId === itemData._id;

        // RESET
        button.style.backgroundColor = '#FFFFFF';
        button.style.color = '#000000';

        button.enable();
        button.label = itemData.timeSlot;

        // BOOKED
        if (isBooked) {

            button.label = `${itemData.timeSlot}`;
            button.disable();

            button.style.backgroundColor = '#E5E5E5';
            button.style.color = '#888888';
            button.style.borderColor = '#E5E5E5';

            return;
        }

        // SELECTED
        if (isSelected) {
            button.style.backgroundColor = '#BF9B30';
            button.style.color = '#FFFFFF';
        }
    });
}

/* =========================
SUBMIT
========================= */

async function handleSubmit() {

    try {

        const bookingDate = $w('#bookingDatePicker').value;

        if (!bookingDate) throw new Error('Select date');
        if (!selectedSlotId) throw new Error('Select slot');

        const userId = local.getItem('userId');
        if (!userId) throw new Error('Login first');

        const existing = await wixData.query('Bookings')
            .eq('selectedDate', bookingDate)
            .eq('timeSlotReferenceId', selectedSlotId)
            .find();

        if (existing.items.length) {
            throw new Error('Already booked');
        }
        // // format date ex: Jun 20, 2026
        // const formattedDate = bookingDate.toLocaleDateString('en-US', {
        //     month: 'short',
        //     day: '2-digit',
        //     year: 'numeric'
        // });

        // ====================================
        /* =========================
        Send email notification
        ========================= */
        // Full email JSON
        const emailData = {
        };

        console.log('[Checkout] emailData to send to triggerOrderEmails:', emailData);

        await run.triggerOrderEmails(emailData);
        // ====================================

        await wixData.insert('Bookings', {
            status: 'pending',
            agentReferenceId: agentId,
            selectedDate: bookingDate,
            timeSlotReferenceId: selectedSlotId,
            userReferenceId: userId
        });

        selectedSlotId = null;
        selectedSlotText = null;

        await loadTimeSlots();
        refreshUI();

        showMessage('Booked successfully', false);

    } catch (err) {
        showMessage(err.message, true);
    }
}

/* =========================
MESSAGE
========================= */

function showMessage(text, error) {

    $w('#messageText').text = text;
    $w('#messageText').style.color = error ? '#FF0000' : '#00AA44';
    $w('#messageText').show();
}