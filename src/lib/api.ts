import {Appointment} from "./model/Appointment";
import User from "./model/User";
import TimeSlot from "./model/TimeSlot";
import Machine from "./model/Machine";
import type {Authentication} from "./model/Authentication";
import { get } from 'svelte/store';
import { authStore } from './stores';

export async function getAppointments(date: Date): Promise<Appointment[]> {
    const authentication: Authentication = get(authStore)
    if(authentication === null){
        throw new Error("Authentication store can't contain null.");
    }

    const rawAppointments: Record<string, unknown>[] = await (await
        fetch(`http://localhost:5173/api/appointments?date=${date.toISOString()}`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${authentication.token}`
            }
        })).json();
    return rawAppointments.map(rawApt => createAppointmentFromRawAppointment(rawApt))
}

/**
 * Create an appointment in the database
 *
 * @param appointment appointment should contain machine, timeSlot, date and user
 */
export async function createAppointment(appointment: Appointment): Promise<Appointment> {
    const authentication: Authentication = get(authStore)
    if(authentication === null){
        throw new Error("Authentication store can't contain null.");
    }

    const response: Response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authentication.token}`
        },
        body: JSON.stringify(appointment)
    })
    if(!response.ok){
        throw new Error(response.statusText);
    }

    return createAppointmentFromRawAppointment(await response.json());
}

/**
 * Delete an appointment in the database
 *
 * @param appointment
 */
export async function deleteAppointment(appointment: Appointment): Promise<boolean> {
    const authentication: Authentication = get(authStore)
    if(authentication === null){
        throw new Error("Authentication store can't contain null.");
    }

    const response = await fetch('/api/appointments', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authentication.token}`
        },
        body: JSON.stringify(appointment)
    });
    if(!response.ok){
        throw new Error(response.statusText);
    }

    return response.ok;
}

function createAppointmentFromRawAppointment(rawAppointment: Record<string, unknown>): Appointment {
    return new Appointment(
        <Date>rawAppointment.date,
        new TimeSlot(<number>rawAppointment.timeSlot),
        new Machine(<string>rawAppointment.machine),
        new User((<User>rawAppointment.user).name, (<User>rawAppointment.user).room));
}