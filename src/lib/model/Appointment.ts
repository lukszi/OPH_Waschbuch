import type User from "./User";
import type TimeSlot from "./TimeSlot";
import type Machine from "./Machine";

export class Appointment {
    user: User | null;
    date: Date;
    timeSlot: TimeSlot;
    machine: Machine;

    constructor(date: Date, timeSlot: TimeSlot, machine: Machine, user: User | null) {
        this.user = user;
        this.date = date;
        this.timeSlot = timeSlot;
        this.machine = machine;
    }

    equals(other: Appointment) {
        return this.date === other.date
            && this.timeSlot.equals(other.timeSlot)
            && this.machine.equals(other.machine)
            && ((this.user === other.user === null)
                || (this.user !== null && other.user !== null
                    && (this.user.equals(other.user))));
    }
}
