export function formattedDateToSQL(dateStr: string): string {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
}

export function convertDateParameters(
  startDate?: string,
  endDate?: string,
): { startDate: Date | undefined; endDate: Date | undefined } {
  let start: Date | undefined;
  let end: Date | undefined;

  if (startDate) {
    start = new Date(formattedDateToSQL(startDate));
    start.setHours(0, 0, 0, 0);
  }

  if (endDate) {
    end = new Date(formattedDateToSQL(endDate));
    end.setHours(23, 59, 59, 999);
  }

  return {
    startDate: start,
    endDate: end,
  };
}
