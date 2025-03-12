import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateUtilsService {
  /**
   * Converts a selected date (YYYY-MM-DD) to UTC format (ISO8601 with 'Z').
   * Ensures the correct UTC conversion based on local time zone.
   */
  convertToUTC(dateString: string): string {
    if (!dateString) return '';

    // Convert selected date (without time) to a Date object in local time
    const localDate = new Date(dateString + 'T00:00:00');

    // Convert to UTC and return ISO string (always ends with 'Z')
    return new Date(localDate.getTime()).toISOString();
  }

  /**
   * Converts an ISO 8601 date string to `YYYY-MM-DD` format for `<input type="date">`.
   */
  formatDateForInput(isoDate: string | null): string | null {
    if (!isoDate) return null;
    return isoDate.split('T')[0]; // Extracts only 'YYYY-MM-DD'
  }
}
