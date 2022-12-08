// Remove Duplicates From Array Of Objects

exportFields = exportFields.filter((fD, index) => {return (exportFields.findIndex((eF) => eF.field === fD.field) === index)});

// Split Date Range Into Desired Intervals

function getDateBlocks(start, end, maxDays) {
let result = [];
let s = new Date(start);

while (s < end) {
  // Create a new date for the block end that is s + maxDays
  let e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + maxDays);
  // Push into an array. If block end is beyond end date, use a copy of end date
  result.push({start:new Date(s), end: e <= end? e : new Date(end)});
  // Increment s to the start of the next block which is one day after 
  // the current block end
  s.setDate(s.getDate() + maxDays + 1);
}
return result;
}

const chunk = (start, end, days) => {
const result = [];
const current = new Date(start.getTime());

do {
  const d1 = new Date(current.getTime());
  const d2 = new Date(current.setDate(current.getDate() + days));

  result.push({
    start: d1,
    end: d2 <= end ? new Date(d2.setDate(d2.getDate() - 1)) : end
  });
} while (current <= end);

return result;
};

const chunks = chunk(
new Date(Date.UTC(2021, 0, 1)),   // Jan 1, 2021
new Date(Date.UTC(2021, 11, 31)), // Dec 31, 2021
90                                // 90 days
);

// Sorting Array Of Objects Into Desired Order

const applyCustomOrder = (arr, sortBy, desiredOrder) => {
  const orderForIndexVals = desiredOrder.slice(0).reverse();
  console.log(orderForIndexVals, 'd')
  arr.sort((a, b) => {
    const aIndex = -orderForIndexVals.indexOf(a[sortBy]);
    const bIndex = -orderForIndexVals.indexOf(b[sortBy]);
    return aIndex - bIndex;
  });

myArray.sort(function(a, b) {
return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);});
};

var withNoDigits = questionText.replace(/[0-9]/g, '');

questionText = questionText.replace(/\d+/g, '');
