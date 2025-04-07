/**
 *
 * FOR LOOP IS LOOPING THRU EVERYTHING BEFORE IT Asking for results for each item, basically queuing up addresses to be inputted but but doing it multiple tinmes for each
 * I think i fixed it, added re fetching transfer locations to loop, we'll see in the morning
 */
function generateIcsForShifts(days) {
  let count = 0;
  let icsContent =
    "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Julian Sanchez//NONSGML UKGtoICS//EN\n";
  let workingShifts = days.reduce(
    (total, day) => total + (day.isOff ? 0 : day.shifts.length),
    0
  );

  return new Promise((res) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = (today.getDate() - 1).toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    // Use async/await to simplify the loop
    const processDays = async () => {
      for (const [index, day] of days.entries()) {
        console.log("Processing day", index, "of", days.length);
        const [busy, defaultAddress, reminders] = await Promise.all([
          settings.get("busy"),
          settings.get("defaultAddress"),
          settings.get("reminders"),
        ]);

        if (!day.isOff) {
          console.log({
            day: day,
            busy: busy,
            defaultAddress: defaultAddress,
            reminders: reminders,
          });

          console.log(day);

          // Process shifts for the current day
          for (const shift of day.shifts) {
            console.log(shift);
            const address = await getAddressForShift(shift); // Wait for the address

            // Generate ICS content with the resolved address
            const newContent = `BEGIN:VEVENT
UID:${ics.formatDate(day.date, shift.startTime)}-4206969@example.com
SUMMARY:Work Shift [${shift.duration}]
${busy ? 'TRANSP:TRANSPARENT' : ''}
DTSTAMP:${ics.formatDate(formattedDate, "12:00AM")}
DTSTART:${ics.formatDate(day.date, shift.startTime)}
DTEND:${ics.formatDate(day.date, shift.endTime)}
LOCATION:${address || defaultAddress || ""}
DESCRIPTION:${ics.generateShiftDescription(shift)}
${reminders ? ics.reminder(45) : null}
END:VEVENT
`;
            icsContent += newContent;
            count++;
          }
        }
      }
    };

    // After ALL days (and their shifts) are processed, resolve the overall promise
    processDays().then(() => {
      icsContent += "END:VCALENDAR";
      console.log(icsContent);
      res(icsContent);
    });
  });
}



// Separate function to handle address logic (async)
function getAddressForShift(shift) {
  return new Promise(async (res, rej) => {
    const transferLocations = await settings.get("transferLocations") || []
    if (shift.orgpath) {
      // 1. Check for Existing Saved Address
      const foundLocation = transferLocations.find(location => location.ukgEntry === shift.orgpath);

      if (foundLocation) {
        res(foundLocation.mapsAddress);
      } else {
        promptForNewAddress(shift.orgpath).then(address => {
          console.log("Resolved:", address)
          res(address)
        })
      }
    } else {
      res(null)
    }
  })
}

// Function to prompt for a new address (async)
const promptedsOrgPaths = {}; // Keep track of answered orgpaths

function promptForNewAddress(orgpath) {
  // Immediately return and do not display modal if already answered
  if (promptedsOrgPaths[orgpath]) {
    return new Promise((res, rej) => {
      console.log("In List")
      console.log(promptedsOrgPaths)
      settings.get("transferLocations").then(tL => {
        console.log(tL)
        if (tL.length > 0) res(tL.find(location => location.ukgEntry === shift.orgpath).mapsAddress);
        else rej("Not Valid!")
      })
    });
  } else {
    return new Promise((res, rej) => {
      console.log("Building Modal...")
      const modal = document.createElement('div');
      modal.id = 'customprompt' + orgpath.replaceAll('/', '_');
      modal.className = 'addyModal';
      modal.style.display = 'block';
      const modalContent = document.createElement('div');
      modalContent.className = 'addyModal-content';
      const closespan = document.createElement('span');
      closespan.className = 'addyModal-close';
      closespan.innerHTML = '&times;';
      const promptparagraph = document.createElement('p');
      promptparagraph.textContent = 'Enter the address for ' + orgpath + ".";
      const userlnput = document.createElement('input');
      userlnput.type = 'text';
      userlnput.id = 'userlnput';
      userlnput.value = "Ad";
      const submitBtn = document.createElement('button');
      submitBtn.id = 'submitlnput';
      submitBtn.textContent = 'Submit';
      submitBtn.onclick = () => {
        const address = userlnput.value;
        settings.get("transferLocations").then(tL => {
          tL = tL || []
          const transferLocations = [...tL];
          const newLocation = {
            ukgEntry: orgpath,
            mapsAddress: address
          };
          transferLocations.push(newLocation);
          settings.set("transferLocations", transferLocations).then(() => {
            settings.get("transferLocations").then(tL => {
              tL = tL || []
              modal.style.display = 'none';
              res(address);
            });
          });
        });
      };
      closespan.onclick = () => {
        modal.style.display = 'none';
      };
      modalContent.appendChild(closespan);
      modalContent.appendChild(promptparagraph);
      modalContent.appendChild(userlnput);
      modalContent.appendChild(submitBtn);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = 'none';
        }
      };
      promptedsOrgPaths[orgpath] = true; // Mark this orgpath as answered
    });
  }
}

if (location.href.includes("mykronos.com")) {
  document.addEventListener("readystatechange", () => {
    // Schedule Print View Code
    if (location.href.includes("/myschedule/print")) {
      window.addEventListener('afterprint', async (e) => {
        const _days = Array.from($$(".entity-list ul")[0].children).filter(child => child.id.includes("myschedule-day"));

        const days = await Promise.all(_days.map(async (day) => {
          const shiftInfo = {
            date: day.id.split('_')[1],
            shifts: [],
            isOff: true
          };

          const shiftDetails = Array.from(day.querySelectorAll('.details'));
          await Promise.all(shiftDetails.map(async (detail) => {
            const timeElement = detail.querySelector('time');

            if (timeElement) {
              shiftInfo.isOff = false;
              let split = timeElement.ariaLabel.split(" ");
              let durationString = split[0] + split[1] + split[2]
              const [startTime, endTime] = durationString.split('-');

              shiftInfo.shifts.push({
                startTime: startTime,
                endTime: endTime,
                duration: split[3],
                isTransfer: detail.querySelector('.primary-orgpath') !== null,
                orgpath: detail.querySelector('.primary-orgpath')?.textContent.trim().replaceAll("\t", "").replaceAll("\n", " ") || ''
              });
            }
          }));

          return shiftInfo;
        }));

        // Generate ICS string after all days and shifts have been processed
        generateIcsForShifts(days).then(icsString => {
          console.log("Got String!")
          const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
          const url = URL.createObjectURL(blob);

          if (navigator.userAgent.toLowerCase().includes('firefox')) {
            Swal.fire("Make sure you allow popups or the file will not download.")
            window.open(url)
          } else {
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = "work_shifts_" + (Date.now()).toString() + ".ics";
            downloadLink.click()
          }

          URL.revokeObjectURL(url);

          Swal.fire({
            icon: "success",
            title: "Successfully exported calendar.",
            text: "To import into Outlook drag downloaded file into the calendar app.",
            footer: '<span>Instructions for: <a target="_blank" href="https://support.google.com/calendar/answer/37118?hl=en&co=GENIE.Platform%3DDesktop">Google Calendar</a> or <a target="_blank" href="https://support.apple.com/guide/calendar/import-or-export-calendars-icl1023/mac#deve82542b62">Apple Calendar</a><span/>'
          }).then(() => {
            window.close()
          });
        });
      })
    }

    // Schedule Overview Page
    else if (location.href.includes('/myschedule')) {
      setTimeout(() => Swal.fire({ title: "Press Print > Choose Timeframe > Preview to Download to Calendar", html: "<span>For first use do multiple exports for each timeframe: current schedule period, then all of the next periods available.<br><br>Otherwise just do the newly published schedule to prevent duplication.</span>" }), 2000)
    }

    //
    else if (location.href.includes("/wfd/home")) {
      // $("")
    }
  })
}
