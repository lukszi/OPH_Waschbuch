import {error, type RequestEvent} from '@sveltejs/kit';
import parseISO from 'date-fns/parseISO'
import {addHours, isAfter, isBefore, isValid, parse, subHours} from "date-fns";
import {
    deleteAppointment,
    findByDate,
    findByDateSlotAndMachine,
    type IAppointment,
    insert
} from "../../../lib/database";
import TimeSlot from "../../../lib/model/TimeSlot";

/**
 * Gets all appointments for the given date
 * Takes a ISO-8601 encoded date as query parameter
 *
 * @throws 400 error if the date parameter is missing or invalid
 * @throws 401 error if the token is invalid
 *
 * @return {Appointment[]} 200 and all appointments for the given date
 */
export async function GET(event: RequestEvent): Promise<Response> {
    const authToken: string = getVerifiedToken(event);
    const room = getAuthenticatedRoom(authToken);
    const dateParam: string | null = event.url.searchParams.get('date');
    if (dateParam == null) {
        throw error(400, 'Missing date parameter');
    }
    const date = parseISO(dateParam);
    if (!isValid(date)) {
        throw error(400, 'Invalid date parameter, ISO-8601 expected');
    }
    const appointments = await findByDate(date);
    // appointments = filterAppointments(appointments);
    return new Response(JSON.stringify(appointments), {status: 200});
}

/**
 * Creates a new appointment
 *
 * @param event should contain a complete appointment object
 *
 * @throws 401 error if the token is invalid
 * @throws 403 error if the user is not allowed to create the passed appointment
 * @throws 409 error if the appointment already exists
 *
 * @return {Appointment} 201 and the created appointment
 */
export async function POST(event: RequestEvent) {
    const authToken: string = getVerifiedToken(event);
    const appointment = await event.request.json();

    // Verify room number can be used with auth token
    const authenticatedRoom = getAuthenticatedRoom(authToken);
    if (appointment.user.room !== authenticatedRoom) {
        throw error(403, 'User in room ' + authenticatedRoom + ' cannot create appointments for room ' + appointment.user.room);
    }
    // Verify slot isn't blocked yet
    const existingAppointment = await findByDateSlotAndMachine(appointment.date, appointment.timeSlot.id, appointment.machine.name);
    if (existingAppointment) {
        throw error(409, "Appointment already exists");
    }
    const createdAppointment = await insert(appointment);
    return new Response(JSON.stringify(createdAppointment), {status: 201});
}

/**
 * Endpoint that deletes an appointment
 *
 * @param event needs to contain the appointment that will be deleted
 * @throws 401 error if the token is invalid
 * @throws 403 error if the user is not allowed to delete the passed appointment
 *
 * @return {Appointment} 200 and deleted appointment
 */
export async function DELETE(event: RequestEvent) {
    const authToken: string = getVerifiedToken(event);
    const authenticatedRoom: string = getAuthenticatedRoom(authToken);
    const appointment = await event.request.json();

    if (appointment.user.room !== authenticatedRoom) {
        throw error(403, 'User in room ' + authenticatedRoom + ' cannot delete appointments belonging to room ' + appointment.user.room);
    }
    // console.log("deleting appointment", appointment);
    const value = await deleteAppointment(appointment);
    return new Response(JSON.stringify(value), {status: 200});
}

/**
 * Parses the payload of a JWT token
 *
 * @param auth complete JWT authToken
 */
function parseTokenPayload(auth: string): Record<string, unknown> {
    try {
        const token: string = auth.split(' ')[1];
        const payload: string = token.split('.')[1];
        const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
        return JSON.parse(decodedPayload);
    }
    catch (e) {
        throw error(401, 'Invalid authentication token provided');
    }
}

/**
 * Get the room number that is authenticated by the given token
 *
 * @param authToken validated authToken
 * @throws 401 error if the room claim is missing
 * @return {string} The room number
 */
function getAuthenticatedRoom(authToken: string): string {
    const payload = parseTokenPayload(authToken);
    try {
        return <string>payload.room;
    } catch (e) {
        throw error(401, 'Token missing room claim');
    }
}

/**
 * Checks whether the request has a valid token and returns it, otherwise terminates the request with a 401
 *
 * @throws 401 error if token is missing, invalid, expired or not issued by this server
 * @return {string} A validated token
 */
function getVerifiedToken(event: RequestEvent): string {
    const auth: string | null = event.request.headers.get('Authorization');

    if (auth === null) {
        throw error(401, 'No authentication token provided');
    }

    // Check if auth is JWT
    const jwtRegex = /^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
    if (!jwtRegex.test(auth)) {
        const invalidAuthError = error(401, 'Invalid authentication token provided');
        invalidAuthError.headers = {'WWW-Authenticate': 'Bearer'};
        throw invalidAuthError;
    }

    // TODO: Verify cryptographic signature
    return auth;
}

// Remove sensitive data from appointments that are not today
function filterAppointments(appointments: IAppointment[], requestingUser = ""): IAppointment[] {
    const date = new Date(new Date().setUTCHours(0, 0, 0, 0));
    const dateRange = [subHours(date, 1), addHours(date, 24)];
    for (const appointment of appointments) {
        const ts = new TimeSlot(appointment.timeSlot)
        const start = parse(ts.start, "HH:mm", appointment.date);
        const end = parse(ts.end, "HH:mm", appointment.date);
        if (appointment.user.name === requestingUser || (isAfter(start, dateRange[0]) && isBefore(end, dateRange[1]))) {
            continue;
        }
        appointment.user = {name: "", room: ""};
    }
    return appointments;
}