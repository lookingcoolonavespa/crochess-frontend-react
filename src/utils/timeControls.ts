const timeControls = [
  createTimeControl(1, 0, 'bullet'),
  createTimeControl(2, 1, 'bullet'),
  createTimeControl(3, 0, 'blitz'),
  createTimeControl(3, 2, 'blitz'),
  createTimeControl(5, 0, 'blitz'),
  createTimeControl(5, 3, 'blitz'),
  createTimeControl(10, 0, 'rapid'),
  createTimeControl(10, 5, 'rapid'),
  createTimeControl(15, 10, 'rapid'),
  createTimeControl(30, 0, 'classical'),
  createTimeControl(30, 20, 'classical'),
  createTimeControl(null, null, 'custom'),
];

function createTimeControl(
  time: number | null,
  increment: number | null,
  type: 'blitz' | 'bullet' | 'rapid' | 'classical' | 'custom'
) {
  return { time, increment, type };
}

export default timeControls;
