import type {Appointment} from "../model/Appointment";
import {buildRequestHeader, createAppointmentFromRawAppointment} from "./helpers";
import {fetchAndHandleError} from "./errorHandling";


export async function getAppointments(date: Date): Promise<Appointment[]> {
    const response = await fetchAndHandleError(
        `/api/appointments?date=${date.toISOString()}`,
        {
            method: "GET",
            headers: buildRequestHeader()
        });

    const rawAppointments: Record<string, unknown>[] = await response.json();
    return rawAppointments.map(rawApt => createAppointmentFromRawAppointment(rawApt))
}

/**
 * Create an appointment in the database
 *
 * @param appointment appointment should contain machine, timeSlot, date and user
 */
export async function createAppointment(appointment: Appointment): Promise<Appointment> {
    const response: Response = await fetchAndHandleError(
        '/api/appointments',
        {
            method: 'POST',
            headers: buildRequestHeader(),
            body: JSON.stringify(appointment)
        });

    return createAppointmentFromRawAppointment(await response.json());
}

/**
 * Delete an appointment in the database
 *
 * @param appointment
 */
export async function deleteAppointment(appointment: Appointment): Promise<void> {
    await fetchAndHandleError(
        '/api/appointments',
        {
            method: 'DELETE',
            headers: buildRequestHeader(),
            body: JSON.stringify(appointment)
        });
}