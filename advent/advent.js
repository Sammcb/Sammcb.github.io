const tasks = [
  'Watch a cheesy Christmas movie',
  'task 2',
  'task 3',
  'task 4',
  'task 5',
  'task 6',
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
  'task 18',
  'task 19',
  'task 20',
  'task 21',
  'task 22',
  'task 23',
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
  if (date.getMonth() !== 10 || date.getDate() < day) return
  document.getElementById(`day${day}`).style.background = 'green'
  document.getElementById(`task${day}`).innerHTML = tasks[day]
}
