const tasks = [
  'Finally listen to some Christmas songs!!',
  'Watch a cheesy Christmas movie',
  'Stargaze',
  'Trip to DC!',
  'Make some winter art',
  'Make a Christmas list',
  'task 7',
  'task 8',
  'task 9',
  'task 10',
  'task 11',
  'Drive to Asheville!',
  'Asheville',
  'Asheville',
  'Asheville',
  'Asheville',
  'Drive home',
  'Drink some peppermint hot cocoa',
  'Bake Christmas cookies',
  'task 20',
  'task 21',
  'task 22',
  'Get and decorate a Christmas plant',
  'Watch A Charlie Brown Christmas'
]

function addDays() {
  for (const [i, task] of tasks.entries()) document.getElementById('calendar').innerHTML += `
    <div id="day${i}" class="day" onclick="reveal(${i})">
      <p id="task${i}">${i + 1}</p>
    </div>
  `
}

function reveal(day) {
  const date = new Date()
  if (date.getMonth() !== 11 || date.getDate() < day) return
  document.getElementById(`day${day}`).style.background = 'green'
  document.getElementById(`task${day}`).innerHTML = tasks[day]
}
