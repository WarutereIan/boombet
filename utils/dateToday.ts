export const dateToday = () => {
  const dateToday = new Date();

  let month = dateToday.getUTCMonth() + 1;
  let year = dateToday.getFullYear();

  const today_date_string = `${year}-${month < 10 ? "0" + month : month}-${
    dateToday.getDate() < 10 ? "0" + dateToday.getDate() : dateToday.getDate()
  }`;

  return today_date_string;
};
