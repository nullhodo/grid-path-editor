export function getFormattedDate(): string {
  const currentDate = new Date();
  const yearNumber = currentDate.getFullYear();
  const monthString = String(currentDate.getMonth() + 1).padStart(2, "0");
  const dayString = String(currentDate.getDate()).padStart(2, "0");
  const hourString = String(currentDate.getHours()).padStart(2, "0");
  const minuteString = String(currentDate.getMinutes()).padStart(2, "0");
  const secondString = String(currentDate.getSeconds()).padStart(2, "0");
  return `${yearNumber}_${monthString}${dayString}_${hourString}${minuteString}${secondString}`;
}
