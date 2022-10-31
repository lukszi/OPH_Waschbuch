import {error, type RequestEvent} from '@sveltejs/kit';
import parseISO from 'date-fns/parseISO'
import {addHours, isAfter, isBefore, isValid, parse, subHours} from "date-fns";
import {deleteAppointment, findByDate, type IAppointment, insert} from "../../../lib/database";
import TimeSlot from "../../../lib/model/TimeSlot";

export async function GET(event: RequestEvent) {
    const dateParam: string | null = event.url.searchParams.get('date');
    if(dateParam == null){
        throw error(400, 'Missing date parameter');
    }
    const date = parseISO(dateParam);
    if(!isValid(date)){
        throw error(400, 'Invalid date parameter, ISO-8601 expected');
    }
    const appointments = await findByDate(date);
    // appointments = filterAppointments(appointments);
    return new Response(JSON.stringify(appointments), {status: 200});
}

export async function POST(event: RequestEvent) {
    const appointment = await event.request.json();
    // TODO: Verify auth tokens
    // TODO: Verify room number can be used with auth token
    // TODO: Verify slot isn't blocked yet
    const createdAppointment = await insert(appointment);
    return new Response(JSON.stringify(createdAppointment), {status: 201});
}

export async function DELETE(event: RequestEvent) {
    const appointment = await event.request.json();
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