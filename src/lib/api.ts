import {Appointment} from "./model/Appointment";
import User from "./model/User";
import TimeSlot from "./model/TimeSlot";
import Machine from "./model/Machine";
import type {Authentication} from "./model/Authentication";

export async function getAppointments(date: Date, authentication: Authentication): Promise<Appointment[]> {
    const rawAppointments: Record<string, unknown>[] = await (await
        fetch(`http://localhost:5173/api/appointments?date=${date.toISOString()}`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${authentication.token}`
            }
        })).json();
    return rawAppointments.map(rawApt => createAppointmentFromRawAppointment(rawApt))
}

export async function createAppointment(appointment: Appointment, authentication: Authentication): Promise<Appointment> {
    const response: Response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authentication.token}`
        },
        body: JSON.stringify(appointment)
    })
    return createAppointmentFromRawAppointment(await response.json());
}

export async function deleteAppointment(appointment: Appointment, authentication: Authentication): Promise<boolean> {
    const response = await fetch('/api/appointments', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authentication.token}`
        },
        body: JSON.stringify(appointment)
    });

    return response.ok;
}

function createAppointmentFromRawAppointment(rawAppointment: Record<string, unknown>): Appointment {
    return new Appointment(
        <Date>rawAppointment.date,
        new TimeSlot(<number>rawAppointment.timeSlot),
        new Machine(<string>rawAppointment.machine),
        new User((<User>rawAppointment.user).name, (<User>rawAppointment.user).room));
}