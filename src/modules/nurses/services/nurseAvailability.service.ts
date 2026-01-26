import NurseProfile, { AvailabilityStatus } from "../../../models/NurseProfile.model";
import NurseAvailability from "../../../models/NurseAvailability.model";
import { parse, isWithinInterval, format } from "date-fns";

export class NurseAvailabilityService {
    /**
     * Check if a nurse is available for a specific date and time
     */
    isNurseAvailable(
        nurse: NurseProfile,
        date: Date,
        time: string,
        elderlyId?: string
    ): boolean {
        // 1. Basic status check
        if (nurse.availability_status === AvailabilityStatus.SUSPENDED ||
            nurse.availability_status === AvailabilityStatus.OFFLINE) {
            return false;
        }

        // 2. Reserved status check
        if (nurse.availability_status === AvailabilityStatus.RESERVED) {
            // If reserved, must match the elderlyId
            if (!elderlyId || nurse.user_id !== elderlyId) {
                // Note: In a real system, we'd check assigned_nurse_id on ElderlyProfile or a separate mapping
                // For this implementation, we'll assume the relationship is handled elsewhere or via specific logic
                // If the user meant "reserved for this particular elder", we'd check that.
                return false;
            }
        }

        // 3. Time slot check
        if (!nurse.availability || nurse.availability.length === 0) {
            return false;
        }

        const dayOfWeek = date.getDay();
        const dateStr = format(date, 'yyyy-MM-dd');

        const matchingSlot = nurse.availability.find(slot => {
            // Check recurring availability
            if (slot.is_recurring && slot.day_of_week === dayOfWeek) {
                return this.isWithinSlot(time, slot.start_time, slot.end_time);
            }
            // Check specific date availability
            if (!slot.is_recurring && slot.specific_date === dateStr as any) {
                return this.isWithinSlot(time, slot.start_time, slot.end_time);
            }
            return false;
        });

        return !!matchingSlot;
    }

    /**
     * Filter a list of nurses based on availability
     */
    filterAvailableNurses(
        nurses: NurseProfile[],
        date: Date,
        time: string,
        elderlyId?: string
    ): NurseProfile[] {
        return nurses.filter(nurse => this.isNurseAvailable(nurse, date, time, elderlyId));
    }

    /**
     * Helper: Check if time is within a slot
     */
    private isWithinSlot(time: string, start: string, end: string): boolean {
        const checkTime = parse(time, 'HH:mm', new Date());
        const startTime = parse(start, 'HH:mm', new Date());
        const endTime = parse(end, 'HH:mm', new Date());

        return isWithinInterval(checkTime, { start: startTime, end: endTime });
    }
}

export const nurseAvailabilityService = new NurseAvailabilityService();
