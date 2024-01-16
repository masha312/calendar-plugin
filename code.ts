figma.showUI(__html__, { width: 340, height: 620 });

figma.ui.onmessage = msg => {
  if (figma.currentPage.selection.length < 1) {
    figma.notify("Please select a calendar :)");
  } else {
    if (msg.type === 'create-calendar') {
      updateCalendar(msg.month, msg.year, msg.weekStart);
    }
  }

};

async function loadFonts() {
  // Find all text nodes
  const textNodes = figma.currentPage.findAll(node => node.type === 'TEXT') as TextNode[];

  // Create a set of unique fonts
  const uniqueFonts = new Set();

  // Iterate over each text node to collect unique fonts
  textNodes.forEach(textNode => {
    const fontName = textNode.fontName;
    if (fontName !== figma.mixed) {
      uniqueFonts.add(fontName);
    }
  });

  // Load each unique font asynchronously
  for (let font of uniqueFonts) {
    await figma.loadFontAsync(font);
  }

  // Now you can safely modify the text nodes
}

// Call the function
loadFonts().then(() => {
  // Perform your plugin operations here after fonts are loaded
}).catch(err => {
  console.error('Error loading fonts: ', err);
});


function updateCalendar(month: number, year: number, weekStart: number) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const daysInMonth = new Date(year, month, 0).getDate();
  let firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const daysInPreviousMonth = new Date(year, month - 1, 0).getDate();

  // Adjust firstDayOfWeek based on the selected start of the week
  if (weekStart === 1 && firstDayOfWeek === 0) {
    firstDayOfWeek = 7;
  }
  firstDayOfWeek -= weekStart;

  let day = 1;
  let prevMonthDay = daysInPreviousMonth - firstDayOfWeek + 1;

  const headerNode = figma.currentPage.selection[0].findAll(node =>
    node.type === 'TEXT' && node.name === 'Month YYYY'
  ) as TextNode[];

  if (headerNode.length > 1) {
    headerNode[0].characters = `${monthNames[month - 1]} ${year}`
  }


  const textNodes = figma.currentPage.selection[0].findAll(node =>
    node.type === 'TEXT' && node.parent && node.parent.name === '.calendar-day'
  ) as TextNode[];


  if (textNodes.length < 1) {
    figma.notify("Can't find any layers with name '.calendar-day' :( ")
  } else {
    textNodes.forEach((textNode: TextNode, index: number) => {
      if (index < firstDayOfWeek) {
        // Fill with days from the previous month
        textNode.characters = `${prevMonthDay}`;
        prevMonthDay++;
      } else if (day <= daysInMonth) {
        // Fill with days from the current month
        textNode.characters = `${day}`;
        day++;
      } else {
        // Start filling with days from the next month
        let nextMonthDay = day - daysInMonth;
        textNode.characters = `${nextMonthDay}`;
        day++;
      }
    });

  }


}



function getDayName(dayIndex: number) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex];
}




