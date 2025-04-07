const ics = {
    test: true,
    reminder(minutes) {
        return `BEGIN:VALARM
TRIGGER:-PT${minutes}M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
`;
    },
    generateShiftDescription(shift) {
        let description = '';
        if (shift.isTransfer) {
            description += 'Transfer Shift at ' + shift.orgpath + '\n';
        }
        return description.trim();
    },
    formatDate(dateString, timeString) {
        console.log(timeString, dateString);
        const [year, month, day] = dateString.split('-').map(Number);
        let [hours, minutes] = timeString.match(/\d+/g).map(Number);

        if (timeString.toLowerCase().includes('pm') && hours !== 12) {
            hours += 12;
        } else if (timeString.toLowerCase().includes('am') && hours === 12) {
            hours = 0;
        }

        const date = new Date(year, month - 1, day, hours, minutes);
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    }
}

window.addEventListener("load", e => {
    window.ics = ics;
    console.log(ics)
})