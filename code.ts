figma.showUI(__html__, { width: 340, height: 620 });


async function main() {
  // Start the loading state
  figma.ui.postMessage({ type: 'loading', status: true });

  try {
    // Perform the font loading
    await loadFonts();
    console.log("loaded fonts!")
    // Post-loading actions
    // ...
  } catch (error) {
    console.error("Error loading fonts:", error);
    figma.ui.postMessage({ type: 'error', message: 'Failed to load fonts.' });
  } finally {
    // End the loading state
    figma.ui.postMessage({ type: 'loading', status: false });
  }
}

main();


figma.ui.onmessage = msg => {
  if (figma.currentPage.selection.length < 1) {
    figma.notify("Please select a calendar :)");
  } else {
    if (msg.type === 'create-calendar') {
      updateCalendar(msg.month, msg.year, msg.weekStart)
    }
  }
};

const fallbackFonts = [
  { family: "Roboto", style: "Regular" },
  { family: "Arial", style: "Regular" },
];

async function loadFonts() {
  const textNodes = figma.currentPage.findAll(node => node.type === 'TEXT') as TextNode[];

  for (const textNode of textNodes) {
    const fontName = textNode.fontName;

    if (fontName !== figma.mixed) {
      try {
        await figma.loadFontAsync(fontName);
      } catch (error) {
        console.error('Error loading font:', fontName, '; Error:', error);
        // Try loading fallback fonts
        for (const fallbackFont of fallbackFonts) {
          try {
            await figma.loadFontAsync(fallbackFont);
            console.log(`Fallback font loaded: ${fallbackFont.family}`);
            break; // Exit loop once a fallback font is loaded
          } catch (fallbackError) {
            console.error('Error loading fallback font:', fallbackFont, '; Error:', fallbackError);
          }
        }
      }
    }
  }
}




function updateCalendar(month: number, year: number, weekStart: number) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const daysInMonth = new Date(year, month, 0).getDate();
  let firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const daysInPreviousMonth = new Date(year, month - 1, 0).getDate();

  if (weekStart === 1 && firstDayOfWeek === 0) {
    firstDayOfWeek = 7;
  }
  firstDayOfWeek -= weekStart;

  let day = 1;
  let prevMonthDay = daysInPreviousMonth - firstDayOfWeek + 1;

  const headerNode = figma.currentPage.selection[0].findAll((node: any) =>
    node.type === 'TEXT' && node.name === 'Month YYYY'
  ) as TextNode[];

  if (headerNode.length > 0) {
    headerNode[0].characters = `${monthNames[month - 1]} ${year}`
  }


  const textNodes = figma.currentPage.selection[0].findAll((node: any) =>
    node.type === 'TEXT' && node.parent && node.parent.name === '.calendar-day'
  ) as TextNode[];


  if (textNodes.length < 1) {
    figma.notify("Can't find any layers with name '.calendar-day' :( ")
  } else {
    textNodes.forEach((textNode: TextNode, index: number) => {
      if (index < firstDayOfWeek) {
        textNode.characters = `${prevMonthDay}`;
        prevMonthDay++;
      } else if (day <= daysInMonth) {
        textNode.characters = `${day}`;
        day++;
      } else {
        let nextMonthDay = day - daysInMonth;
        textNode.characters = `${nextMonthDay}`;
        day++;
      }
    });
    figma.notify("Updated calendar 🎉")
  }

}



function getDayName(dayIndex: number) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex];
}




