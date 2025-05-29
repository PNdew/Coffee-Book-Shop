export interface AttendanceResponse {
  success: boolean;
  is_checked_in: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  message?: string;
  is_late?: boolean;
  distance?: number;
}