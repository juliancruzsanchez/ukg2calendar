function generateIcsForShifts(days) {

  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = (today.getDate() - 1).toString().padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Julian Sanchez//NONSGML UKGtoICS//EN\n";

  days.forEach(day => {
    if (!day.isOff) {
      day.shifts.forEach(shift => {
        icsContent += `BEGIN:VEVENT
UID:${formatDateForIcs(day.date, shift.startTime)}-4206969@example.com
SUMMARY:Work Shift [${shift.duration}]
DTSTAMP:${formatDateForIcs(formattedDate, "12:00AM")}
DTSTART:${formatDateForIcs(day.date, shift.startTime)}
DTEND:${formatDateForIcs(day.date, shift.endTime)}
LOCATION:${shift.orgpath || ''}
DESCRIPTION:${generateShiftDescription(shift)}
END:VEVENT
`;
      })
    }
  });

  icsContent += "END:VCALENDAR";
  return icsContent;
}

function formatDateForIcs(dateString, timeString) {
  console.log(timeString, dateString);
  const [year, month, day] = dateString.split('-').map(Number);
  let [hours, minutes] = timeString.match(/\d+/g).map(Number); // Extract numbers from time string

  // Convert to military time, handling noon (12 PM) correctly
  if (timeString.toLowerCase().includes('pm') && hours !== 12) {
    hours += 12;
  } else if (timeString.toLowerCase().includes('am') && hours === 12) {
    hours = 0;
  }

  // Create the Date object with the corrected hours
  const date = new Date(year, month - 1, day, hours, minutes); // Month is 0-indexed

  // Format to ICS standard (YYYYMMDDTHHMMSSZ)
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function generateShiftDescription(shift) {
  let description = '';
  // Add more details to the description as needed.
  if (shift.isTransfer) {
    description += 'Transfer Shift at ' + shift.orgpath + '\n';
  }
  return description.trim();
}

if (window.location.href.includes("mykronos.com")) {
  document.addEventListener("readystatechange", () => {
    if (window.location.href.includes("/myschedule/print")) {
      window.addEventListener('afterprint', (event) => {

        const daysE = Array.from(document.querySelectorAll(".entity-list ul")[0].children).filter(child => child.id.includes("myschedule-day"));

        const days = daysE.map(day => {
          const shiftInfo = {};

          // Extract date from day element's ID
          const date = day.id.split('_')[1];
          shiftInfo.date = date;

          // Get all the shift details elements within the current day.
          const shiftDetails = Array.from(day.querySelectorAll('.details'));

          // Iterate through each shift detail element.
          shiftInfo.shifts = shiftDetails.map(detail => {
            const shift = {};

            // Extract start and end times.
            const timeElement = detail.querySelector('time');
            if (!timeElement) {
              shiftInfo.isOff = true;
              return;
            } else {
              let split = timeElement.ariaLabel.split(" ");
              let durationString = split[0] + split[1] + split[2]
              const [startTime, endTime] = durationString.split('-');
              shift.startTime = startTime;
              shift.endTime = endTime;
              shiftInfo.isOff = false;
              const totalHrs = split[3]
              shift.duration = totalHrs
            }

            // Check if it's a transfer shift.
            const isTransfer = detail.querySelector('.primary-orgpath') !== null;
            shift.isTransfer = isTransfer;

            // Extract orgpath if it's a transfer shift.
            if (isTransfer) {
              const orgpathElement = detail.querySelector('.primary-orgpath');
              shift.orgpath = orgpathElement.textContent.trim().replaceAll("\t", "").replaceAll("\n", " ");
            }
            if (shiftInfo.isOff) shift = undefined;
            return shift;
          });
          if (shiftInfo.shifts.length == 0 || shiftInfo.shifts.join("") === "") {
            shiftInfo.isOff = true
            delete shiftInfo.shifts;
          }
          return shiftInfo;
        });
        const icsString = generateIcsForShifts(days);

        const downloadLink = document.createElement('a');
        downloadLink.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsString);
        downloadLink.download = "work_shifts_" + (Date.now()).toString() + ".ics";
        downloadLink.click();

        Swal.fire({
          icon: "success",
          title: "Successfully exported calendar.",
          text: "To import into Outlook drag downloaded file into the calendar app.",
          footer: '<span>Instructions for: <a target="_blank" href="https://support.google.com/calendar/answer/37118?hl=en&co=GENIE.Platform%3DDesktop">Google Calendar</a> or <a target="_blank" href="https://support.apple.com/guide/calendar/import-or-export-calendars-icl1023/mac#deve82542b62">Apple Calendar</a><span/>'
        }).then(() => {
          window.close()
        });
      })
    }
    
    else if (window.location.href.includes('/myschedule')) {
      Swal.fire("Press Print > Preview to Download to Calendar")
    }
  })
}