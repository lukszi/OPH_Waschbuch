import {type Writable, writable, derived, type Readable} from "svelte/store";
import {Appointment} from "./model/Appointment";
import type Machine from "./model/Machine";
import type TimeSlot from "./model/TimeSlot";
import type {Authentication} from "./model/Authentication";
import User from "./model/User";

export const selectedDate = writable<Date>(new Date((new Date()).setUTCHours(0, 0, 0, 0)));
export const appointmentsStore: Writable<Appointment[]> = writable([]);

export function getAppointment(machine: Machine, slot: TimeSlot): Readable<Appointment> {
    return derived([appointmentsStore, selectedDate], ([$appointmentsStore, $selectedDate]) => {
        const appointment = $appointmentsStore.find(a => a.machine.equals(machine) && a.timeSlot.equals(slot));
        return appointment ? appointment : new Appointment($selectedDate, slot, machine, null);
    });
}

export const authStore = writable<Authentication>(undefined);

export const userStore = derived(authStore, $authStore => {
    if (!$authStore)
        return null;
    return new User($authStore.decoded.name, $authStore.decoded.room)
});