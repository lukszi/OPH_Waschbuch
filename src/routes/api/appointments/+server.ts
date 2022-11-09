import {error, type RequestEvent} from '@sveltejs/kit';
import parseISO from 'date-fns/parseISO'
import {addHours, isAfter, isBefore, isValid, parse, subHours} from "date-fns";
import {
    countAppointmentsByRoomAndDate,
    deleteAppointment,
    findByDate,
    findByDateSlotAndMachine,
    type IAppointment,
    insert
} from "../../../lib/server/database";
import TimeSlot from "../../../lib/model/TimeSlot";
import {getAuthenticatedRoom, getVerifiedToken} from "../../../lib/server/auth";

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
 * @throws 409 error if the appointment already exists or the user already has too many appointments that day
 *
 * @return {Appointment} 201 and the created appointment
 */
export async function POST(event: RequestEvent): Promise<Response> {
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
    // Verify user doesn't have too many appointments that day
    const appointments = await countAppointmentsByRoomAndDate(authenticatedRoom, appointment.date);
    if (appointments >= 2) {
        throw error(409, "Too many appointments that day");
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
export async function DELETE(event: RequestEvent): Promise<Response> {
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