import {Appointment} from "./model/Appointment";
import User from "./model/User";
import TimeSlot from "./model/TimeSlot";
import Machine from "./model/Machine";
import type {Authentication} from "./model/Authentication";
import {get} from 'svelte/store';
import {authStore} from './stores';
import {AuthenticationError, AuthorizationError, NetworkError, RequestError, ServerError} from "./errors";


export async function getAppointments(date: Date): Promise<Appointment[]> {
    let response
    try {
        response = await fetch(`/api/appointments?date=${date.toISOString()}`,
            {headers: buildRequestHeader()});
    } catch (e) {
        throw e instanceof TypeError ? new NetworkError("Could not connect to server: " + e.message) : e;
    }

    if (!response.ok) {
        handleFailedRequest(response);
    }

    const rawAppointments: Record<string, unknown>[] = await response.json();
    return rawAppointments.map(rawApt => createAppointmentFromRawAppointment(rawApt))
}

/**
 * Create an appointment in the database
 *
 * @param appointment appointment should contain machine, timeSlot, date and user
 */
export async function createAppointment(appointment: Appointment): Promise<Appointment> {
    let response: Response
    try {
        response = await fetch('/api/appointments', {
            method: 'POST',
            headers: buildRequestHeader(),
            body: JSON.stringify(appointment)
        })
    } catch (e) {
        throw e instanceof TypeError ? new NetworkError("Could not connect to server: " + e.message) : e;
    }

    if (!response.ok) {
        handleFailedRequest(response);
    }

    return createAppointmentFromRawAppointment(await response.json());
}

/**
 * Delete an appointment in the database
 *
 * @param appointment
 */
export async function deleteAppointment(appointment: Appointment): Promise<void> {
    let response: Response
    try {
        response = await fetch('/api/appointments', {
            method: 'DELETE',
            headers: buildRequestHeader(),
            body: JSON.stringify(appointment)
        });
    } catch (e) {
        throw e instanceof TypeError ? new NetworkError("Could not connect to server: " + e.message) : e;
    }

    if (!response.ok) {
        handleFailedRequest(response);
    }
}


//
// Santa's little helpers
//

/**
 * Construct and throw corresponding errors for failed requests
 *
 * @throws RequestError if response status is 400, 409
 * @throws AuthorizationError if response status is 401
 * @throws AuthenticationError if response status is 403
 * @throws ServerError if response status is 5XX
 * @throws Error if response status is not expected
 *
 * @param response
 */
function handleFailedRequest(response: Response) {
    if (response.status === 401) {
        throw new AuthenticationError(response.statusText);
    }
    if (response.status === 400) {
        throw new RequestError(response.statusText, response.status);
    }
    if (response.status === 403) {
        throw new AuthorizationError(response.statusText);
    }
    if (response.status === 409) {
        throw new RequestError(response.statusText, response.status);
    }
    if (response.status >= 500 && response.status < 600) {
        throw new ServerError(response.statusText, response.status);
    }
    throw new Error("Unknown network request error: " + response.statusText);
}

/**
 * Fetch authentication from store
 *
 * @throws AuthenticationError if authentication is not yet set
 * @return {Authentication} Authentication object from store
 */
function getAuth(): Authentication {
    const authentication: Authentication = get(authStore)
    if (authentication === null) {
        throw new AuthenticationError("User not logged in, authStore is empty.");
    }
    return authentication;
}

/**
 * Build request header with authentication token
 */
function buildRequestHeader(): { "Content-Type": string, "Authorization": string } {
    const auth: Authentication = getAuth();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
    }
}

function createAppointmentFromRawAppointment(rawAppointment: Record<string, unknown>): Appointment {
    return new Appointment(
        <Date>rawAppointment.date,
        new TimeSlot(<number>rawAppointment.timeSlot),
        new Machine(<string>rawAppointment.machine),
        new User((<User>rawAppointment.user).name, (<User>rawAppointment.user).room));
}