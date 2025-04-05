import { Tooltip } from "antd";
import * as XLSX from "xlsx";

const getNextSevenDays = (targetDay: any) => {
  const days = [];

  const currentDate = new Date();

  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(targetDay);
    nextDate.setDate(targetDay.getDate() + i);

    const day = nextDate.getDate();
    const month = nextDate.getMonth() + 1;
    const year = nextDate.getFullYear();
    const weekDay = capitalized(
      nextDate
        .toLocaleDateString("pt-BR", { weekday: "long" })
        .split("-")[0]
        .trim()
    );
    const label = formatDates(
      { day, month, year, weekDay },
      nextDate,
      currentDate
    );
    days.push({ day, month, year, weekDay, label, key: i, date: nextDate });
  }

  return days;
};

const formatArrayFromDates = (dates: any) => {
  return dates.map(
    (date: any) =>
      `${date.day < 10 ? `0${date.day}` : date.day}-${date.month < 10 ? `0${date.month}` : date.month
      }-${date.year}`
  );
};

const prepareDateToShow = (date: any, currentDate = new Date()) => {
  const [year, month, day] = date.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  const weekOfDay = utcDate.getDay();
  const weekDay = capitalizedWeekDay(weekOfDay);

  const label = formatDates(
    { day, month, year, weekDay },
    utcDate,
    currentDate
  );

  return { day, month, year, weekDay, label };
};

const capitalizedWeekDay = (weekOfDay: number) => {
  switch (weekOfDay) {
    case 0:
      return "Domingo";
    case 1:
      return "Segunda-feira";
    case 2:
      return "Terça-feira";
    case 3:
      return "Quarta-feira";
    case 4:
      return "Quinta-feira";
    case 5:
      return "Sexta-feira";
    case 6:
      return "Sábado";
    default:
      return "";
  }
};

const capitalized = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatDates = (date: any, targetDate: any, currentDate: any) => {
  const { day, month, year, weekDay } = date;

  currentDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  let nameDay = "";

  if (targetDate.getTime() === currentDate.getTime()) {
    nameDay = "Hoje - ";
  }

  if (targetDate.getTime() === currentDate.getTime() + 24 * 60 * 60 * 1000) {
    nameDay = "Amanhã - ";
  }

  return `${nameDay}${weekDay}, ${day} de ${getMonthName(month)}, ${year}`;
};

const getMonthName = (month: number) => {
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return monthNames[month - 1];
};

const cutLongText = (value: any, maxLength: number = 28) => {
  if (!value) {
    return '';
  }

  let text = value;

  if (value.length > maxLength) {
    text = text.substr(0, maxLength) + '...';

    return <Tooltip placement="top" title={value}>{text}</Tooltip>
  }

  return text;
};

const downloadExcel = (data: any, filename: string = 'DataSheetExported') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filename + '.xlsx');
};

const authorizedAccess = (
  modulePermissions: string[],
  permissions: string[]
) => permissions.some((permission: string) => modulePermissions.includes(permission));

const formatCurrency = (price: number) => (price || 0).toLocaleString('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2
});

export {
  getNextSevenDays,
  getMonthName,
  formatDates,
  prepareDateToShow,
  formatArrayFromDates,
  cutLongText,
  downloadExcel,
  authorizedAccess,
  capitalized,
  formatCurrency
};
