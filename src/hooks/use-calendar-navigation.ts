'use client';

import { useState, useMemo } from 'react';
import { buildCalendarDays, formatDateString, getMonthName } from '@/lib/scheduling-utils';

export function useCalendarNavigation(
  batchStartDate: Date,
  defaultDate?: string
) {
  const [selectedDayDate, setSelectedDayDate] = useState<string>(
    defaultDate || formatDateString(batchStartDate)
  );
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    new Date(batchStartDate.getFullYear(), batchStartDate.getMonth(), 1)
  );

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  const calendarDaysList = useMemo(
    () => buildCalendarDays(year, month),
    [year, month]
  );

  const goToPrevMonth = () => {
    setCalendarMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth(new Date(year, month + 1, 1));
  };

  return {
    selectedDayDate,
    setSelectedDayDate,
    calendarMonth,
    year,
    month,
    calendarDaysList,
    goToPrevMonth,
    goToNextMonth,
    monthName: getMonthName(month),
  };
}
